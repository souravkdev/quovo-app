from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "conversation_type", "created_at"]
    list_filter = ["conversation_type", "created_at"]
    search_fields = ["title", "user__email"]
    ordering = ["-created_at"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["conversation", "role", "content_preview", "created_at"]
    list_filter = ["role", "created_at"]
    search_fields = ["conversation__title", "content"]
    ordering = ["-created_at"]
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = "Content"
