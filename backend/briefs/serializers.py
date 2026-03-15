from rest_framework import serializers
from .models import Brief

class BriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brief
        fields = [
            "id",
            "slug",
            "raw_input",
            "generated_data",
            "is_approved",
            "approved_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "approved_at", "created_at", "updated_at"]

class BriefCreateSerializer(serializers.ModelSerializer):
    client_message = serializers.CharField(required=True)
    freelancer_type = serializers.CharField(required=True)
    hourly_rate = serializers.IntegerField(required=True)
    extra_context = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Brief
        fields = ["client_message", "freelancer_type", "hourly_rate", "extra_context"]

class BriefDetailSerializer(serializers.ModelSerializer):
    project_title = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    deliverables = serializers.SerializerMethodField()
    timeline_weeks = serializers.SerializerMethodField()
    revision_rounds = serializers.SerializerMethodField()
    price_estimate_min = serializers.SerializerMethodField()
    price_estimate_max = serializers.SerializerMethodField()
    assumptions = serializers.SerializerMethodField()
    out_of_scope = serializers.SerializerMethodField()
    next_steps = serializers.SerializerMethodField()

    class Meta:
        model = Brief
        fields = [
            "id",
            "slug",
            "project_title",
            "summary",
            "deliverables",
            "timeline_weeks",
            "revision_rounds",
            "price_estimate_min",
            "price_estimate_max",
            "assumptions",
            "out_of_scope",
            "next_steps",
            "is_approved",
            "approved_at",
            "created_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "approved_at"]

    def _get_generated_data(self, obj):
        return obj.generated_data or {}

    def get_project_title(self, obj):
        return self._get_generated_data(obj).get("project_title", "")

    def get_summary(self, obj):
        return self._get_generated_data(obj).get("summary", "")

    def get_deliverables(self, obj):
        return self._get_generated_data(obj).get("deliverables", [])

    def get_timeline_weeks(self, obj):
        return self._get_generated_data(obj).get("timeline_weeks", 0)

    def get_revision_rounds(self, obj):
        return self._get_generated_data(obj).get("revision_rounds", 0)

    def get_price_estimate_min(self, obj):
        return self._get_generated_data(obj).get("price_estimate_min", 0)

    def get_price_estimate_max(self, obj):
        return self._get_generated_data(obj).get("price_estimate_max", 0)

    def get_assumptions(self, obj):
        return self._get_generated_data(obj).get("assumptions", [])

    def get_out_of_scope(self, obj):
        return self._get_generated_data(obj).get("out_of_scope", [])

    def get_next_steps(self, obj):
        return self._get_generated_data(obj).get("next_steps", [])
