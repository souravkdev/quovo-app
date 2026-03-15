from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from django.http import StreamingHttpResponse
import json

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from . import services


class ConversationViewSet(viewsets.ModelViewSet):
    """
    API endpoints for AI conversations with multi-feature streaming support.
    
    Features:
    - /chat/ - General conversation (streaming)
    - /analyze_brief/ - Analyze a generated brief (streaming)
    - /price_recommendation/ - Get pricing suggestions (streaming)
    - /client_communication/ - Generate client communication templates (streaming)
    """
    
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=["post"], url_path="chat")
    def chat(self, request: Request):
        """
        Stream general chat conversation with Claude.
        
        Request body:
        {
            "conversation_id": "uuid (optional - for existing conv)",
            "message": "User message"
        }
        """
        try:
            message_text = request.data.get("message", "").strip()
            if not message_text:
                return Response(
                    {"error": "Message required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            conversation_id = request.data.get("conversation_id")
            
            # Get or create conversation
            if conversation_id:
                conversation = Conversation.objects.get(id=conversation_id, user=request.user)
            else:
                conversation = Conversation.objects.create(
                    user=request.user,
                    conversation_type="chat",
                    title=message_text[:50] + "..." if len(message_text) > 50 else message_text
                )
            
            # Save user message
            Message.objects.create(
                conversation=conversation,
                role="user",
                content=message_text
            )
            
            # Get conversation history
            messages = [
                {
                    "role": msg.role,
                    "content": msg.content
                }
                for msg in conversation.messages.all()
            ]
            
            # Stream response from Claude
            return StreamingHttpResponse(
                self._stream_response(services.general_chat_stream(messages), conversation),
                content_type="application/x-ndjson"
            )
        
        except Conversation.DoesNotExist:
            return Response(
                {"error": "Conversation not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=["post"], url_path="analyze_brief")
    def analyze_brief(self, request: Request):
        """
        Stream brief analysis with Claude.
        
        Request body:
        {
            "brief_id": "uuid",
            "question": "Specific question about brief (optional)"
        }
        """
        try:
            from briefs.models import Brief
            
            brief_id = request.data.get("brief_id")
            question = request.data.get("question", "")
            
            if not brief_id:
                return Response(
                    {"error": "brief_id required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            brief = Brief.objects.get(id=brief_id, user=request.user)
            
            # Create or get conversation
            conversation, created = Conversation.objects.get_or_create(
                user=request.user,
                brief=brief,
                conversation_type="brief_analysis",
                defaults={"title": f"Analysis: {brief.generated_data.get('project_title', 'Brief')}"}
            )
            
            # Save user question
            Message.objects.create(
                conversation=conversation,
                role="user",
                content=question or "Analyze this brief"
            )
            
            # Extract brief data from JSON field
            brief_data = brief.generated_data or {}
            
            # Stream analysis
            return StreamingHttpResponse(
                self._stream_response(
                    services.analyze_brief_stream(brief_data, question),
                    conversation
                ),
                content_type="application/x-ndjson"
            )
        
        except Brief.DoesNotExist:
            return Response(
                {"error": "Brief not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=["post"], url_path="price_recommendation")
    def price_recommendation(self, request: Request):
        """
        Stream pricing recommendations with Claude.
        
        Request body:
        {
            "brief_id": "uuid",
            "context": "Additional context about pricing (optional)"
        }
        """
        try:
            from briefs.models import Brief
            
            brief_id = request.data.get("brief_id")
            context = request.data.get("context", "")
            
            if not brief_id:
                return Response(
                    {"error": "brief_id required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            brief = Brief.objects.get(id=brief_id, user=request.user)
            
            # Create or get conversation
            conversation, created = Conversation.objects.get_or_create(
                user=request.user,
                brief=brief,
                conversation_type="price_recommendation",
                defaults={"title": f"Pricing: {brief.generated_data.get('project_title', 'Brief')}"}
            )
            
            # Save user request
            Message.objects.create(
                conversation=conversation,
                role="user",
                content=context or "Get pricing recommendations"
            )
            
            brief_data = brief.generated_data or {}
            
            # Stream pricing recommendations
            return StreamingHttpResponse(
                self._stream_response(
                    services.price_recommendation_stream(brief_data, context),
                    conversation
                ),
                content_type="application/x-ndjson"
            )
        
        except Brief.DoesNotExist:
            return Response(
                {"error": "Brief not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=["post"], url_path="client_communication")
    def client_communication(self, request: Request):
        """
        Stream client communication templates with Claude.
        
        Request body:
        {
            "brief_id": "uuid",
            "need": "proposal|kickoff_email|scope_clarification|progress_update|change_request|closing"
        }
        """
        try:
            from briefs.models import Brief
            
            brief_id = request.data.get("brief_id")
            need = request.data.get("need", "proposal")
            
            if not brief_id:
                return Response(
                    {"error": "brief_id required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            brief = Brief.objects.get(id=brief_id, user=request.user)
            
            # Create or get conversation
            conversation, created = Conversation.objects.get_or_create(
                user=request.user,
                brief=brief,
                conversation_type="client_communication",
                defaults={"title": f"Communication: {brief.generated_data.get('project_title', 'Brief')}"}
            )
            
            # Save request
            Message.objects.create(
                conversation=conversation,
                role="user",
                content=f"Generate: {need}"
            )
            
            brief_data = brief.generated_data or {}
            
            # Stream communication template
            return StreamingHttpResponse(
                self._stream_response(
                    services.client_communication_stream(brief_data, need),
                    conversation
                ),
                content_type="application/x-ndjson"
            )
        
        except Brief.DoesNotExist:
            return Response(
                {"error": "Brief not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _stream_response(self, generator, conversation):
        """
        Wrapper to stream response and save to database.
        Yields: NDJSON formatted chunks
        """
        full_response = ""
        
        try:
            for chunk in generator:
                full_response_data = json.loads(chunk)
                full_response += full_response_data.get("content", "")
                yield chunk
            
            # Save complete assistant message to database
            Message.objects.create(
                conversation=conversation,
                role="assistant",
                content=full_response
            )
            
            # Final message indicating completion
            yield json.dumps({"type": "done", "content": ""}) + "\n"
        
        except Exception as e:
            yield json.dumps({"type": "error", "error": str(e)}) + "\n"
