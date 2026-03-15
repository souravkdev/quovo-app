from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("github/", views.github_login, name="github-login"),
    path("github/callback/", views.github_callback, name="github-callback"),
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("password/forgot/", views.forgot_password, name="forgot-password"),
    path("password/reset/", views.reset_password, name="reset-password"),
    path("password/change/", views.change_password, name="change-password"),
    path("logout/", views.logout, name="logout"),
    path("me/", views.get_me, name="get-me"),
    path("me/update/", views.update_profile, name="update-profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]