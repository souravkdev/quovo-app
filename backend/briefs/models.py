from django.db import models
from django.contrib.auth import get_user_model
import uuid
import secrets

User = get_user_model()

class Brief(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="briefs")
    slug = models.CharField(max_length=10, unique=True, editable=False)
    raw_input = models.JSONField()  # stores client_message, freelancer_type, hourly_rate, extra_context
    generated_data = models.JSONField(null=True, blank=True)  # stores AI-generated brief
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    approver_ip = models.CharField(max_length=45, blank=True, null=True)  # supports IPv6
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Brief {self.slug} by {self.user.email}"

    def save(self, *args, **kwargs):
        if not self.slug:
            # Generate unique 10-character slug from URL-safe characters
            while True:
                self.slug = secrets.token_urlsafe(10)[:10]
                if not Brief.objects.filter(slug=self.slug).exists():
                    break
        super().save(*args, **kwargs)
