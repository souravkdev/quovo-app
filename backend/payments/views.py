from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import json
from .services import create_checkout_session, verify_webhook_signature, handle_checkout_completed, handle_subscription_deleted
from .models import StripeEvent


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout(request):
    """
    Create a Stripe checkout session for plan upgrade.
    
    Request body:
    {
        "plan": "pro" | "agency"
    }
    """
    plan = request.data.get("plan")
    
    if plan not in ["pro", "agency"]:
        return Response(
            {"error": "Invalid plan. Must be 'pro' or 'agency'"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        result = create_checkout_session(request.user, plan)
        return Response(
            {
                "session_id": result["session_id"],
                "checkout_url": result["checkout_url"]
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def webhook(request):
    """
    Handle Stripe webhook events.
    Stripe events:
    - checkout.session.completed: Subscription created/upgraded
    - customer.subscription.deleted: Subscription cancelled
    """
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    
    if not sig_header:
        return Response(
            {"error": "Missing Stripe signature"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        event = verify_webhook_signature(payload, sig_header)
    except ValueError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Log the event
    try:
        StripeEvent.objects.create(
            stripe_event_id=event["id"],
            event_type=event["type"],
            data=event["data"]["object"]
        )
    except Exception:
        pass  # Continue processing even if logging fails
    
    # Handle specific events
    try:
        if event["type"] == "checkout.session.completed":
            handle_checkout_completed(event["data"]["object"])
            
        elif event["type"] == "customer.subscription.deleted":
            handle_subscription_deleted(event["data"]["object"])
        
        # Mark event as processed if it exists
        try:
            stripe_event = StripeEvent.objects.get(stripe_event_id=event["id"])
            stripe_event.processed = True
            stripe_event.save()
        except StripeEvent.DoesNotExist:
            pass
        
        return Response(
            {"status": "success"},
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

