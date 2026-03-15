from typing import Optional, Tuple

from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import authentication, exceptions
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken


class CookieJWTAuthentication(authentication.BaseAuthentication):
    """
    JWT auth that reads the access token from an HttpOnly cookie named 'access_token'.
    Falls back to the standard Authorization header handled by SimpleJWT if needed.
    """

    www_authenticate_realm = "api"

    def authenticate(self, request: Request) -> Optional[Tuple[object, None]]:
        raw_token = request.COOKIES.get("access_token")

        # Fallback to header-based auth if no cookie present.
        if not raw_token:
          jwt_auth = JWTAuthentication()
          return jwt_auth.authenticate(request)

        try:
            validated_token = AccessToken(raw_token)
        except Exception:
            raise exceptions.AuthenticationFailed(_("Invalid or expired token"))

        user_model = get_user_model()
        try:
            user = user_model.objects.get(id=validated_token["user_id"])
        except user_model.DoesNotExist:
            raise exceptions.AuthenticationFailed(_("User not found"))

        if not user.is_active:
            raise exceptions.AuthenticationFailed(_("User is inactive"))

        return (user, None)

