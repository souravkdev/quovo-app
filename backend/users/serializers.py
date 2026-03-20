from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "name", "avatar_url",
            "plan", "freelancer_type", "hourly_rate",
            "logo_url", "created_at", "email_verified"
        ]
        read_only_fields = ["id", "email", "plan", "created_at", "email_verified"]