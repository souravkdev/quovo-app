from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("github/", views.github_login, name="github-login"),
    path("github/callback/", views.github_callback, name="github-callback"),
    path("me/", views.get_me, name="get-me"),
    path("me/update/", views.update_profile, name="update-profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]