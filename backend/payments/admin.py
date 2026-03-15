from django.contrib import admin
from .models import Payment, StripeEvent


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "plan", "status", "amount_cents", "created_at")
    list_filter = ("status", "plan", "created_at")
    search_fields = ("user__email", "stripe_session_id", "stripe_subscription_id")
    readonly_fields = ("id", "created_at", "metadata")
    fieldsets = (
        ("Payment Info", {
            "fields": ("id", "user", "plan", "status", "created_at")
        }),
        ("Stripe", {
            "fields": ("stripe_session_id", "stripe_subscription_id", "amount_cents")
        }),
        ("Timeline", {
            "fields": ("completed_at",)
        }),
        ("Metadata", {
            "fields": ("metadata",)
        }),
    )


@admin.register(StripeEvent)
class StripeEventAdmin(admin.ModelAdmin):
    list_display = ("stripe_event_id", "event_type", "processed", "created_at")
    list_filter = ("event_type", "processed", "created_at")
    search_fields = ("stripe_event_id",)
    readonly_fields = ("stripe_event_id", "event_type", "data", "created_at")

