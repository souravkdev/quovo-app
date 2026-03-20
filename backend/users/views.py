from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import redirect
from django.utils import timezone
import uuid
import requests
from .models import User, PasswordResetToken, EmailVerificationToken
from .serializers import UserSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def set_auth_cookies(response, access: str, refresh: str):
    """
    Helper to attach HttpOnly auth cookies to a response.
    """
    frontend_url = settings.FRONTEND_URL
    secure_flag = frontend_url.startswith("https://")
    cookie_params = {
        "secure": secure_flag,
        "httponly": True,
        "samesite": "Lax",
        "path": "/",
    }
    response.set_cookie("access_token", access, **cookie_params)
    # Refresh token is longer-lived, but we still store it as HttpOnly cookie.
    response.set_cookie("refresh_token", refresh, **cookie_params)
    return response


def send_email_verification(user: User) -> str:
    """
    Creates a new one-time verification token and sends an email to the user.
    Returns the raw token (mainly for debugging/dev use).
    """
    # Invalidate any previous unused tokens for this user.
    EmailVerificationToken.objects.filter(user=user, used=False).update(used=True)

    token = uuid.uuid4().hex
    EmailVerificationToken.objects.create(
        user=user,
        token=token,
        expires_at=timezone.now() + timezone.timedelta(days=1),
    )

    verification_url = f"{settings.FRONTEND_URL}/verify-email/?token={token}"
    send_mail(
        subject="Verify your email address",
        message=(
            f"Hi {user.name or ''},\n\n"
            "Thanks for creating your Quovo account.\n"
            f"Please verify your email by clicking:\n{verification_url}\n\n"
            "If you didn't create this account, you can ignore this email."
        ),
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@quovo.local"),
        recipient_list=[user.email],
        fail_silently=True,  # allows dev/console email backend to keep the flow working
    )
    return token


@api_view(["GET"])
@permission_classes([AllowAny])
@authentication_classes([])
def github_login(request):
    """
    Step 1 — redirect user to GitHub authorization page.
    Frontend just opens: GET /auth/github/
    """
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&scope=user:email"
    )
    return redirect(github_auth_url)


@api_view(["GET"])
@permission_classes([AllowAny])
@authentication_classes([])
def github_callback(request):
    """
    Step 2 — GitHub redirects back here with a code.
    We exchange it for an access token, fetch the user, issue JWT.
    """
    code = request.GET.get("code")
    if not code:
        return Response(
            {"error": "No code provided by GitHub"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Exchange code for GitHub access token
    token_response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
        }
    )
    token_data = token_response.json()
    github_access_token = token_data.get("access_token")

    if not github_access_token:
        return Response(
            {"error": "Failed to get access token from GitHub"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Fetch GitHub user profile
    user_response = requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {github_access_token}"}
    )
    github_user = user_response.json()

    # Fetch email separately (may be private on profile)
    email_response = requests.get(
        "https://api.github.com/user/emails",
        headers={"Authorization": f"Bearer {github_access_token}"}
    )
    emails = email_response.json()
    primary_email = next(
        (e["email"] for e in emails if e["primary"] and e["verified"]),
        None
    )

    if not primary_email:
        return Response(
            {"error": "No verified email found on GitHub account"},
            status=status.HTTP_400_BAD_REQUEST
        )

    github_id = str(github_user["id"])
    name = github_user.get("name") or github_user.get("login", "")
    avatar_url = github_user.get("avatar_url", "")

    # Find or create user
    user = User.objects.filter(google_id=github_id).first()  # reusing google_id field for provider id
    if not user:
        user = User.objects.filter(email=primary_email).first()
        if user:
            user.google_id = github_id
            user.avatar_url = avatar_url
            user.save()
        else:
            user = User.objects.create_user(
                email=primary_email,
                name=name,
                avatar_url=avatar_url,
                google_id=github_id,
            )
    # GitHub marks the email as verified. Treat it as verified on our side too.
    if not user.email_verified:
        user.email_verified = True
        user.save(update_fields=["email_verified"])

    tokens = get_tokens_for_user(user)

    # Redirect to frontend without exposing tokens in URL.
    frontend_url = settings.FRONTEND_URL
    response = redirect(f"{frontend_url}/auth/callback")
    return set_auth_cookies(response, tokens["access"], tokens["refresh"])


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def register(request):
    """
    Email/password registration.
    """
    email = request.data.get("email")
    password = request.data.get("password")
    name = request.data.get("name") or ""

    if not email or not password:
        return Response(
            {"detail": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    UserModel = get_user_model()
    existing = UserModel.objects.filter(email=email).first()

    if existing and existing.has_usable_password():
        # If they haven't verified their email yet, resend a verification email.
        if not existing.email_verified:
            send_email_verification(existing)
            return Response(
                {
                    "detail": "verification_required",
                    "email": existing.email,
                    "email_verified": False,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"detail": "An account with this email already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if existing and not existing.has_usable_password():
        user = existing
        user.name = name or user.name
        user.set_password(password)
        user.save()
    else:
        user = UserModel.objects.create_user(email=email, name=name, password=password)

    # For new/password accounts we require email verification before login.
    if not user.email_verified:
        send_email_verification(user)
        return Response(
            {
                "detail": "verification_required",
                "email": user.email,
                "email_verified": False,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

    # Email already verified: create session via JWT cookies.
    tokens = get_tokens_for_user(user)
    data = {
        "user": UserSerializer(user).data,
    }
    response = Response(data, status=status.HTTP_201_CREATED)
    return set_auth_cookies(response, tokens["access"], tokens["refresh"])


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def verify_email(request):
    """
    Verifies the user's email using the one-time token from the verification email.
    Expects JSON body: { "token": "..." }
    """
    token = request.data.get("token") or request.query_params.get("token")
    if not token:
        return Response(
            {"detail": "Verification token is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        verification = (
            EmailVerificationToken.objects.select_related("user")
            .get(token=token)
        )
    except EmailVerificationToken.DoesNotExist:
        return Response(
            {"detail": "Invalid or expired verification token"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not verification.is_valid():
        return Response(
            {"detail": "Invalid or expired verification token"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Mark token used and verify the user.
    verification.used = True
    verification.save(update_fields=["used"])

    user = verification.user
    user.email_verified = True
    user.save(update_fields=["email_verified"])

    return Response(
        {"detail": "Email verified successfully", "email_verified": True},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def resend_verification(request):
    """
    Resends a new verification email.
    Expects JSON body: { "email": "user@example.com" }
    """
    email = request.data.get("email")
    if not email:
        return Response(
            {"detail": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Avoid leaking whether an email exists.
    user = User.objects.filter(email=email).first()
    if not user:
        return Response(
            {"detail": "If an account exists, a verification email was sent."},
            status=status.HTTP_200_OK,
        )

    if user.email_verified:
        return Response(
            {"detail": "Email already verified", "email_verified": True},
            status=status.HTTP_200_OK,
        )

    send_email_verification(user)
    return Response(
        {"detail": "Verification email sent. Please check your inbox."},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def login(request):
    """
    Email/password sign-in. Returns JWT access/refresh pair.
    """
    email = request.data.get("email")
    password = request.data.get("password")
    if not email or not password:
        return Response(
            {"detail": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, email=email, password=password)
    if not user:
        return Response(
            {"detail": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not getattr(user, "email_verified", False):
        return Response(
            {"detail": "Email not verified"},
            status=status.HTTP_403_FORBIDDEN,
        )

    tokens = get_tokens_for_user(user)
    data = {
        "user": UserSerializer(user).data,
    }
    response = Response(data)
    return set_auth_cookies(response, tokens["access"], tokens["refresh"])


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def forgot_password(request):
    """
    Request a password reset.
    Currently returns a generic success message to avoid leaking
    whether an email is registered. Hook email sending here later.
    """
    email = request.data.get("email")
    if not email:
        return Response(
            {"detail": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # In production, look up the user and send an email with a reset link.
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        # Invalidate old tokens for this user
        PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
        reset_token = uuid.uuid4().hex
        PasswordResetToken.objects.create(
            user=user,
            token=reset_token,
            expires_at=timezone.now() + timezone.timedelta(hours=1),
        )
        # TODO: send email with link f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    return Response({"detail": "If an account exists, a reset link was sent."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Authenticated password change.
    """
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not current_password or not new_password:
        return Response(
            {"detail": "Both current and new password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user
    if not user.check_password(current_password):
        return Response(
            {"detail": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()
    tokens = get_tokens_for_user(user)
    response = Response({"detail": "Password updated successfully"})
    return set_auth_cookies(response, tokens["access"], tokens["refresh"])


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def reset_password(request):
    """
    Final step of password reset using a one-time token.
    """
    token = request.data.get("token")
    new_password = request.data.get("new_password")

    if not token or not new_password:
        return Response(
            {"detail": "Token and new password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        reset = PasswordResetToken.objects.select_related("user").get(token=token, used=False)
    except PasswordResetToken.DoesNotExist:
        return Response(
            {"detail": "Invalid or expired token"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if reset.expires_at < timezone.now():
        reset.used = True
        reset.save(update_fields=["used"])
        return Response(
            {"detail": "Invalid or expired token"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = reset.user
    user.set_password(new_password)
    user.save()
    reset.used = True
    reset.save(update_fields=["used"])

    tokens = get_tokens_for_user(user)
    data = {
        "user": UserSerializer(user).data,
        "detail": "Password reset successfully",
    }
    response = Response(data)
    return set_auth_cookies(response, tokens["access"], tokens["refresh"])


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def logout(request):
    """
    Logs out the user by clearing auth cookies.
    """
    response = Response({"detail": "Logged out"})
    # Overwrite cookies with empty values and immediate expiry.
    for name in ["access_token", "refresh_token"]:
        response.delete_cookie(name, path="/")
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_me(request):
    return Response(UserSerializer(request.user).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)