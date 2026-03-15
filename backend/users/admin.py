from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "name", "plan", "created_at")
    list_filter = ("plan", "is_staff")
    search_fields = ("email", "name")
    ordering = ("-created_at",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("name", "avatar_url", "google_id", "freelancer_type", "hourly_rate")}),
        ("Plan", {"fields": ("plan", "stripe_customer_id", "stripe_subscription_id")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
    )
    add_fieldsets = (
        (None, {"fields": ("email", "password1", "password2")}),
    )