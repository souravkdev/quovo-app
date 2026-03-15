from rest_framework import serializers


class CreateCheckoutSerializer(serializers.Serializer):
    """Serializer for creating Stripe checkout session"""
    plan = serializers.ChoiceField(choices=["pro", "agency"])


class CheckoutResponseSerializer(serializers.Serializer):
    """Response from checkout creation"""
    session_id = serializers.CharField()
    checkout_url = serializers.CharField()
