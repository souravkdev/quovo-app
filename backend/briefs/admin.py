from django.contrib import admin
from .models import Brief

@admin.register(Brief)
class BriefAdmin(admin.ModelAdmin):
    list_display = ("slug", "user", "is_approved", "created_at")
    list_filter = ("is_approved", "created_at", "user__plan")
    search_fields = ("slug", "user__email", "generated_data")
    readonly_fields = ("id", "slug", "created_at", "updated_at")
    fieldsets = (
        ("Brief Info", {
            "fields": ("id", "slug", "user", "created_at", "updated_at")
        }),
        ("Input", {
            "fields": ("raw_input",)
        }),
        ("Generated Brief", {
            "fields": ("generated_data",)
        }),
        ("Approval", {
            "fields": ("is_approved", "approved_at", "approver_ip")
        }),
    )
