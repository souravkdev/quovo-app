from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Conversation(models.Model):
    """Store AI conversations between user and Claude."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ai_conversations")
    
    conversation_type = models.CharField(
        max_length=50,
        choices=[
            ("chat", "General Chat"),
            ("brief_analysis", "Brief Analysis"),
            ("price_recommendation", "Price Recommendation"),
            ("client_communication", "Client Communication"),
        ],
        default="chat"
    )
    
    title = models.CharField(max_length=200, blank=True, default="New Conversation")
    
    # For brief analysis and recommendations
    brief = models.ForeignKey(
        "briefs.Brief",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="ai_conversations"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-updated_at"]
    
    def __str__(self):
        return f"{self.conversation_type} - {self.title} ({self.user.email})"


class Message(models.Model):
    """Store individual messages in a conversation."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    
    role = models.CharField(
        max_length=10,
        choices=[
            ("user", "User"),
            ("assistant", "Claude"),
        ]
    )
    
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["created_at"]
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."
