from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from datetime import timedelta
from .models import Brief
from .serializers import BriefSerializer, BriefCreateSerializer, BriefDetailSerializer
from .services import generate_brief
import json


class BriefViewSet(viewsets.ModelViewSet):
    queryset = Brief.objects.all()
    serializer_class = BriefSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        """Return briefs for the current user"""
        return Brief.objects.filter(user=self.request.user)

    def get_permissions(self):
        """Allow public access to specific endpoints"""
        if self.action in ['public_detail', 'approve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def generate(self, request):
        """
        Generate a new brief from client message.
        Enforces 5 briefs/month limit for free plan.
        """
        # Check plan limits
        if request.user.plan == "free":
            # Count briefs created in the last 30 days
            thirty_days_ago = timezone.now() - timedelta(days=30)
            briefs_this_month = Brief.objects.filter(
                user=request.user,
                created_at__gte=thirty_days_ago
            ).count()
            
            if briefs_this_month >= 5:
                return Response(
                    {
                        "error": "Monthly brief limit reached",
                        "message": "Free plan is limited to 5 briefs per month. Upgrade to Pro or Agency plan for unlimited briefs."
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED
                )

        # Validate input
        serializer = BriefCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Generate brief using AI service
            generated_data = generate_brief(
                client_message=serializer.validated_data["client_message"],
                freelancer_type=serializer.validated_data["freelancer_type"],
                hourly_rate=serializer.validated_data["hourly_rate"],
                extra_context=serializer.validated_data.get("extra_context", "")
            )

            # Create brief object
            brief = Brief.objects.create(
                user=request.user,
                raw_input={
                    "client_message": serializer.validated_data["client_message"],
                    "freelancer_type": serializer.validated_data["freelancer_type"],
                    "hourly_rate": serializer.validated_data["hourly_rate"],
                    "extra_context": serializer.validated_data.get("extra_context", ""),
                },
                generated_data=generated_data
            )

            return Response(
                {
                    "brief": BriefDetailSerializer(brief).data,
                    "message": "Brief generated successfully"
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {
                    "error": "Failed to generate brief",
                    "message": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["get"], url_path="public/(?P<slug>[^/.]+)", permission_classes=[AllowAny])
    def public_detail(self, request, slug=None):
        """Get a brief by slug without authentication"""
        try:
            brief = Brief.objects.get(slug=slug)
            serializer = BriefDetailSerializer(brief)
            return Response(serializer.data)
        except Brief.DoesNotExist:
            return Response(
                {"error": "Brief not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["post"], url_path="approve/(?P<slug>[^/.]+)", permission_classes=[AllowAny])
    def approve(self, request, slug=None):
        """Approve a brief by slug without authentication"""
        try:
            brief = Brief.objects.get(slug=slug)
            
            if brief.is_approved:
                return Response(
                    {"message": "Brief already approved"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get approver IP
            x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
            if x_forwarded_for:
                approver_ip = x_forwarded_for.split(",")[0]
            else:
                approver_ip = request.META.get("REMOTE_ADDR")
            
            # Mark as approved
            brief.is_approved = True
            brief.approved_at = timezone.now()
            brief.approver_ip = approver_ip
            brief.save()
            
            return Response(
                {
                    "message": "Brief approved successfully",
                    "brief": BriefDetailSerializer(brief).data
                },
                status=status.HTTP_200_OK
            )
        except Brief.DoesNotExist:
            return Response(
                {"error": "Brief not found"},
                status=status.HTTP_404_NOT_FOUND
            )
