# Claude LLM Integration Setup

## Overview

Your Quovo app now has **Claude (Anthropic)** integrated with **4 powerful AI features** and **real-time streaming responses**:

1. **General Chat** - Ask Claude anything about projects, business, communication
2. **Brief Analysis** - AI analysis of your generated briefs with improvement suggestions
3. **Pricing Recommendations** - Get data-driven pricing guidance based on brief details
4. **Client Communication** - Generate professional templates for proposals, emails, scope docs, etc.

---

## Backend Setup

### Installation ✅

- Anthropic SDK installed: `pip install anthropic`
- New Django app created: `ai_assistant`
- Database migrations applied: `Conversation` and `Message` models

### Files Created

```
backend/ai_assistant/
├── models.py              # Conversation & Message models (stores chat history)
├── services.py            # Claude integration with 4 streaming functions
├── views.py               # ViewSet with 4 streaming API endpoints
├── serializers.py         # Serializers for API responses
├── urls.py                # Router registration
├── admin.py               # Django admin interface
└── migrations/
    └── 0001_initial.py    # Database tables
```

### Environment Variables

Add your Claude API key to `backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

**Get your API key:**
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to API Keys section
4. Create new API key
5. Copy and paste into `.env`

---

## API Endpoints

All endpoints require authentication (Bearer token in Authorization header).

### 1. General Chat

**Endpoint:** `POST /ai/conversations/chat/`

**Request:**
```json
{
  "message": "How do I price a web design project?",
  "conversation_id": "uuid-optional"  // for continuing conversation
}
```

**Response:** NDJSON streaming (newline-delimited JSON)
```
{"type": "text", "content": "Great question! "}
{"type": "text", "content": "When pricing..."}
{"type": "done", "content": ""}
```

**Frontend:** `/app/ai/chat/page.tsx` - Full chatbot interface

---

### 2. Brief Analysis

**Endpoint:** `POST /ai/conversations/analyze_brief/`

**Request:**
```json
{
  "brief_id": "brief-uuid",
  "question": "Specific question (optional)"
}
```

**Response:** NDJSON stream with detailed analysis

**Features:**
- Analyzes all brief fields (deliverables, timeline, scope, pricing, etc.)
- Provides improvement suggestions
- Identifies risks and opportunities
- Stores conversation history for reference

---

### 3. Pricing Recommendations

**Endpoint:** `POST /ai/conversations/price_recommendation/`

**Request:**
```json
{
  "brief_id": "brief-uuid",
  "context": "Additional context (optional)"
}
```

**Response:** NDJSON stream with:
- Recommended pricing range with reasoning
- Deliverable-based pricing breakdown
- Market comparison insights
- Risk factors and upsell opportunities

---

### 4. Client Communication Templates

**Endpoint:** `POST /ai/conversations/client_communication/`

**Request:**
```json
{
  "brief_id": "brief-uuid",
  "need": "proposal"  // See options below
}
```

**Supported Templates:**
- `proposal` - Professional project proposal
- `kickoff_email` - Project kickoff email
- `scope_clarification` - Questions to clarify scope
- `progress_update` - Client progress update
- `change_request` - Change request handling template
- `closing` - Project completion email

---

## Frontend Components

### 1. AI Chat Page

**File:** `/app/ai/chat/page.tsx`

- Real-time streaming chat interface
- Persistent conversation history
- Animated loading state
- Responsive design with dark theme

**Access:** `/ai/chat`

### 2. Brief AI Tools

**File:** `/app/ai/brief/[slug]/page.tsx`

- Tabbed interface: Analysis | Pricing | Communication
- One-click generation with streaming display
- Copy/save capabilities
- Context-aware to specific brief

**Access:** `/ai/brief/{slug}` (integrate into brief view)

---

## Database Models

### Conversation Model
```python
- id: UUID (primary key)
- user: ForeignKey to User
- brief: ForeignKey to Brief (optional)
- conversation_type: [chat|brief_analysis|price_recommendation|client_communication]
- title: Auto-generated from first message
- created_at, updated_at: Timestamps
```

### Message Model
```python
- id: UUID
- conversation: ForeignKey to Conversation
- role: [user|assistant]
- content: Full message text
- created_at: Timestamp
```

**Access:** Django admin at `/admin/`
- View conversation history
- Search by type, user, or content
- Track AI usage patterns

---

## Streaming Architecture

### Why Streaming?

✅ **Better UX:** Users see responses token-by-token (no waiting)
✅ **Real-time:** Immediate feedback while Claude is "thinking"
✅ **Cost-efficient:** Can cancel early if response is off-track
✅ **Scalable:** Doesn't block server for long-running responses

### Implementation

1. **Backend** (`services.py`):
   - Uses `client.messages.stream()` from Anthropic SDK
   - Yields JSON chunks with `yield` statements
   - Captures full response to save to database

2. **Transport** (HTTP Response):
   - Content-Type: `application/x-ndjson`
   - Each line is valid JSON (newline-delimited)
   - Flask/Django HttpResponse handles streaming

3. **Frontend** (`fetch` with streaming):
   - Reads response as text stream
   - Splits by newlines and parses each JSON chunk
   - Updates UI incrementally

---

## Testing Locally

### 1. Start Backend
```bash
cd backend
source ../venv/bin/activate
python manage.py runserver
```

### 2. Test Chat Endpoint
```bash
curl -X POST http://localhost:8000/ai/conversations/chat/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "What is a good freelance rate?"}'
```

### 3. Test in Frontend

- Go to `/ai/chat` → Chat with Claude
- Generate a brief → Go to `/ai/brief/{slug}` → Use AI tools
- Try all 4 features to see streaming in action

---

## Configuration Options

### Model Selection

Current model: `claude-3-5-sonnet-20241022`

To change, edit `backend/ai_assistant/services.py` line 8:
```python
MODEL = "claude-3-opus-20250219"  # Most capable
MODEL = "claude-3-5-sonnet-20241022"  # Balanced (current)
MODEL = "claude-3-haiku-20250307"  # Fast & cheap
```

### Max Tokens

Current: 2048 tokens per response

To adjust, edit `backend/ai_assistant/services.py` in `chat_stream()`:
```python
max_tokens=2048,  # Change this
```

### System Prompts

Each feature has a customizable system prompt. Edit `backend/ai_assistant/services.py`:
- `chat_stream()` - General chat personality
- `analyze_brief_stream()` - Analysis tone
- `price_recommendation_stream()` - Pricing expertise
- `client_communication_stream()` - Writing style

---

## Cost Tracking

Anthropic pricing (as of 2025):
- **Input:** $3 / 1M tokens
- **Output:** $15 / 1M tokens

For 2,048 token responses:
- Approximately **$0.03-0.04 per request**
- 100 conversations = ~$3-4

Monitor usage in Anthropic Console: https://console.anthropic.com

---

## Error Handling

### Common Issues

**`ANTHROPIC_API_KEY not configured`**
- Solution: Add key to `.env` and restart Django

**`Conversation not found`**
- Verify brief exists and belongs to logged-in user

**`Rate limited (429)`**
- Wait a minute, then retry
- Or upgrade API tier on console.anthropic.com

**Streaming cuts off early**
- Check browser DevTools network tab
- Verify `max_tokens` isn't too low

---

## Next Steps

### Suggested Enhancements

1. **Save & Export**
   - Export AI analysis as PDF
   - Email recommendations to client
   - Generate contracts from templates

2. **Advanced Features**
   - Multi-turn analysis (ask follow-up questions)
   - Batch analysis (analyze multiple briefs)
   - AI-powered brief improvement suggestions
   - Real-time collaboration on documents

3. **Analytics**
   - Track which features are most used
   - Monitor AI decision accuracy
   - Cost per user analysis

4. **Integration**
   - Integrate analysis into brief approval workflow
   - Auto-generate client email templates
   - Populate contract fields from AI analysis

---

## Files Modified

- `settings.py` → Added `ai_assistant` app
- `urls.py` → Added `/ai/` route
- `.env` → Added `ANTHROPIC_API_KEY`
- `frontend/.env.local` → (no changes needed)

---

## Verification Checklist

- ✅ Anthropic SDK installed
- ✅ `ai_assistant` app created
- ✅ Database migrations applied
- ✅ Environment variable configured
- ✅ Django check passing
- ✅ API endpoints registered
- ✅ Frontend pages created
- ✅ Streaming architecture implemented

---

**Status:** 🚀 **Ready to use!**

Add your Claude API key to `.env`, restart Django, and start asking Claude to help with your projects!
