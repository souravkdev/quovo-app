from django.urls import path
from . import views

urlpatterns = [
    path("create-checkout/", views.create_checkout, name="create_checkout"),
    path("webhook/", views.webhook, name="stripe_webhook"),
]