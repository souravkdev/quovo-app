import stripe
import os
from django.conf import settings

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

STRIPE_PRO_PRICE_ID = os.getenv("STRIPE_PRO_PRICE_ID")
STRIPE_AGENCY_PRICE_ID = os.getenv("STRIPE_AGENCY_PRICE_ID")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def create_checkout_session(user, plan: str):
    """
    Create a Stripe checkout session for plan upgrade.
    
    Args:
        user: The User object
        plan: Either "pro" or "agency"
    
    Returns:
        dict: Contains 'session_id' and 'checkout_url'
    """
    if plan == "pro":
        price_id = STRIPE_PRO_PRICE_ID
        plan_name = "Pro Plan"
    elif plan == "agency":
        price_id = STRIPE_AGENCY_PRICE_ID
        plan_name = "Agency Plan"
    else:
        raise ValueError(f"Invalid plan: {plan}")
    
    try:
        # Create or get Stripe customer
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.name or user.email,
                metadata={"user_id": str(user.id)}
            )
            user.stripe_customer_id = customer.id
            user.save()
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=f"{FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/pricing",
            metadata={
                "user_id": str(user.id),
                "plan": plan,
                "email": user.email,
            }
        )
        
        return {
            "session_id": session.id,
            "checkout_url": session.url
        }
    
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def handle_checkout_completed(session_data: dict):
    """
    Handle successful checkout completion.
    Upgrade user plan and store subscription ID.
    
    Args:
        session_data: Stripe checkout.session.completed event data
    """
    from django.contrib.auth import get_user_model
    from .models import Payment
    from datetime import datetime
    
    User = get_user_model()
    
    # Extract metadata
    metadata = session_data.get("metadata", {})
    user_id = metadata.get("user_id")
    plan = metadata.get("plan")
    subscription_id = session_data.get("subscription")
    
    if not user_id or not plan:
        raise ValueError("Missing required metadata in checkout session")
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ValueError(f"User {user_id} not found")
    
    # Update user plan and subscription
    user.plan = plan
    user.stripe_subscription_id = subscription_id
    user.save()
    
    # Log payment
    amount_cents = session_data.get("amount_total")
    Payment.objects.create(
        user=user,
        stripe_session_id=session_data.get("id"),
        stripe_subscription_id=subscription_id,
        status="completed",
        amount_cents=amount_cents,
        plan=plan,
        completed_at=datetime.utcnow(),
        metadata=session_data
    )


def handle_subscription_deleted(subscription_data: dict):
    """
    Handle subscription cancellation.
    Downgrade user back to free plan.
    
    Args:
        subscription_data: Stripe customer.subscription.deleted event data
    """
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    subscription_id = subscription_data.get("id")
    
    try:
        user = User.objects.get(stripe_subscription_id=subscription_id)
        user.plan = "free"
        user.stripe_subscription_id = None
        user.save()
    except User.DoesNotExist:
        # Subscription not found in our system, ignore
        pass


def verify_webhook_signature(payload: bytes, sig_header: str):
    """
    Verify that the webhook came from Stripe.
    
    Args:
        payload: Raw request body
        sig_header: Signature header from request
    
    Returns:
        dict: Parsed event data if valid
    
    Raises:
        ValueError: If signature verification fails
    """
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise ValueError(f"Invalid payload: {str(e)}")
    except stripe.error.SignatureVerificationError as e:
        raise ValueError(f"Invalid signature: {str(e)}")
    
    return event
