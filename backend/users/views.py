from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.shortcuts import redirect
import requests
from .models import User
from .serializers import UserSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@api_view(["GET"])
@permission_classes([AllowAny])
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

    tokens = get_tokens_for_user(user)

    # Redirect to frontend with tokens as query params
    frontend_url = settings.FRONTEND_URL
    return redirect(
        f"{frontend_url}/auth/callback"
        f"?access={tokens['access']}"
        f"&refresh={tokens['refresh']}"
    )


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