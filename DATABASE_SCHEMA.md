# Quovo Backend Database Schema

## Overview
Complete database schema for the Quovo SaaS platform with 6 main tables managing users, briefs, payments, and AI conversations.

---

## 📊 Database Tables

### 1. **USER** Table
Stores user account information and subscription details.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | String | UNIQUE | User's email address |
| `name` | String | - | User's full name |
| `avatar_url` | URL | - | Profile picture from GitHub/OAuth |
| `google_id` | String | UNIQUE | Google OAuth ID (if OAuth used) |
| `plan` | Enum | FREE \| PRO \| AGENCY | Subscription tier |
| `stripe_customer_id` | String | - | Stripe customer identifier |
| `stripe_subscription_id` | String | - | Stripe subscription ID |
| `logo_url` | URL | - | User's business logo |
| `freelancer_type` | String | - | Profession (e.g., "Web Developer") |
| `hourly_rate` | Integer | - | Hourly rate in USD for pricing estimates |
| `is_active` | Boolean | DEFAULT: TRUE | Account status |
| `is_staff` | Boolean | DEFAULT: FALSE | Admin flag |
| `created_at` | DateTime | AUTO | Account creation timestamp |
| `updated_at` | DateTime | AUTO | Last update timestamp |

**Relationships:**
- ➡️ One USER to Many BRIEFS (1:N)
- ➡️ One USER to Many PAYMENTS (1:N)
- ➡️ One USER to Many CONVERSATIONS (1:N)

---

### 2. **BRIEF** Table
Stores project briefs generated from client messages.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique brief identifier |
| `user_id` | UUID | FOREIGN KEY → USER | Owner of the brief |
| `slug` | String | UNIQUE | 10-character URL-safe identifier |
| `raw_input` | JSON | - | Original user input containing client_message, freelancer_type, hourly_rate, extra_context |
| `generated_data` | JSON | - | AI-generated brief with scope, timeline, pricing, deliverables |
| `is_approved` | Boolean | DEFAULT: FALSE | Client approval status |
| `approved_at` | DateTime | NULL | Timestamp when client approved |
| `approver_ip` | String (IPv6) | - | IP address of approver for audit |
| `created_at` | DateTime | AUTO | Brief creation timestamp |
| `updated_at` | DateTime | AUTO | Last modification timestamp |

**Relationships:**
- ➡️ Many BRIEFS belong to One USER (N:1)
- ➡️ One BRIEF to Many CONVERSATIONS (1:N)

**Example `raw_input` JSON:**
```json
{
  "client_message": "We need a website...",
  "freelancer_type": "Web Developer",
  "hourly_rate": 75,
  "extra_context": "Needs e-commerce support"
}
```

**Example `generated_data` JSON:**
```json
{
  "project_title": "E-commerce Website",
  "summary": "Full-featured e-commerce platform...",
  "deliverables": ["Homepage", "Product Catalog", "Checkout"],
  "timeline_weeks": 8,
  "revision_rounds": 2,
  "price_estimate_min": 4800,
  "price_estimate_max": 6000,
  "assumptions": ["Client provides product data"],
  "out_of_scope": ["Marketing"],
  "next_steps": ["Kickoff meeting"]
}
```

---

### 3. **PAYMENT** Table
Tracks payment transactions and subscription events via Stripe.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique payment identifier |
| `user_id` | UUID | FOREIGN KEY → USER | User making payment |
| `stripe_session_id` | String | UNIQUE | Stripe checkout session ID |
| `stripe_subscription_id` | String | - | Stripe subscription ID (for recurring) |
| `status` | Enum | PENDING \| COMPLETED \| FAILED \| CANCELLED | Payment status |
| `amount_cents` | Integer | - | Amount in cents (e.g., 2900 for $29.00) |
| `plan` | String | PRO \| AGENCY | Plan being purchased |
| `created_at` | DateTime | AUTO | Payment initiation timestamp |
| `completed_at` | DateTime | NULL | When payment succeeded |
| `metadata` | JSON | - | Additional Stripe data for audit |

**Relationships:**
- ➡️ Many PAYMENTS belong to One USER (N:1)

**Example metadata:**
```json
{
  "stripe_response": {...},
  "description": "Pro plan upgrade",
  "prev_plan": "free"
}
```

---

### 4. **STRIPE_EVENT** Table
Webhook event logging for Stripe payment processing.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `stripe_event_id` | String | PRIMARY KEY | Stripe event ID |
| `event_type` | String | - | Event type (e.g., "payment_intent.succeeded") |
| `data` | JSON | - | Full Stripe event payload |
| `processed` | Boolean | DEFAULT: FALSE | Whether event was processed |
| `created_at` | DateTime | AUTO | Webhook receipt timestamp |

**Purpose:** Debug and replay webhook events if needed.

---

### 5. **CONVERSATION** Table
Stores AI chat conversations for multiple features.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique conversation identifier |
| `user_id` | UUID | FOREIGN KEY → USER | Conversation owner |
| `brief_id` | UUID | FOREIGN KEY → BRIEF (NULL) | Brief being analyzed (if applicable) |
| `conversation_type` | Enum | CHAT \| BRIEF_ANALYSIS \| PRICE_RECOMMENDATION \| CLIENT_COMMUNICATION | Type of conversation |
| `title` | String | DEFAULT: "New Conversation" | User-friendly title |
| `created_at` | DateTime | AUTO | Conversation start time |
| `updated_at` | DateTime | AUTO | Last message time |

**Relationships:**
- ➡️ Many CONVERSATIONS belong to One USER (N:1)
- ➡️ Many CONVERSATIONS reference One BRIEF (N:1, optional)
- ➡️ One CONVERSATION to Many MESSAGES (1:N)

**Conversation Types:**
- `chat` - General AI chat assistant
- `brief_analysis` - Analysis of a specific brief
- `price_recommendation` - Pricing guidance based on brief
- `client_communication` - Email/proposal templates

---

### 6. **MESSAGE** Table
Individual messages in AI conversations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique message identifier |
| `conversation_id` | UUID | FOREIGN KEY → CONVERSATION | Parent conversation |
| `role` | Enum | USER \| ASSISTANT | Message sender |
| `content` | Text | - | Message body (supports streaming) |
| `created_at` | DateTime | AUTO | Message timestamp |

**Relationships:**
- ➡️ Many MESSAGES belong to One CONVERSATION (N:1)

---

## 🔗 Relationships Summary

```
USER (1) ────→ (N) BRIEF
USER (1) ────→ (N) PAYMENT
USER (1) ────→ (N) CONVERSATION
BRIEF (1) ───→ (N) CONVERSATION
CONVERSATION (1) ──→ (N) MESSAGE
```

---

## 📈 Data Flow

### Brief Generation Flow
1. User creates → BRIEF record (raw_input populated)
2. AI processes → generates_data
3. Client accesses via slug → Brief record
4. Client approves → is_approved = TRUE, approved_at set

### Payment Flow
1. User initiates checkout → PAYMENT created (pending)
2. Stripe processes → Stripe webhook
3. STRIPE_EVENT logged
4. PAYMENT status updated → completed
5. USER plan updated (free → pro/agency)

### AI Conversation Flow
1. User opens AI Chat → CONVERSATION created
2. User sends message → MESSAGE (role: user)
3. AI responds → MESSAGE (role: assistant)
4. Repeat until conversation ends

### Brief Analysis Flow
1. User views brief → clicks "Analyze with AI"
2. CONVERSATION created (type: brief_analysis, brief_id set)
3. Messages exchanged → CONVERSATION contains multiple MESSAGEs
4. Analysis stored as messages (not separate field)

---

## 🔐 Key Features

✅ **UUID Primary Keys** - Better security, globally unique  
✅ **Soft Deletes Ready** - Can add `is_deleted` field  
✅ **Audit Trail** - created_at, updated_at on all tables  
✅ **JSON Storage** - Flexible data for briefs & Stripe metadata  
✅ **Foreign Keys** - Referential integrity  
✅ **Unique Constraints** - email, slug, stripe_session_id  
✅ **Enums** - Type safety for plan, status, role  

---

## 📝 SQL Relationships (Django ORM)

### Users to Briefs
```python
# Get all briefs for a user
user.briefs.all()

# Get a specific brief
brief.user  # Back reference
```

### Users to Payments
```python
# Get all payments for a user
user.payments.all()

# Filter by status
user.payments.filter(status='completed')
```

### Users to Conversations
```python
# Get all conversations
user.ai_conversations.all()

# Get chats only
user.ai_conversations.filter(conversation_type='chat')
```

### Conversations to Messages
```python
# Get all messages in a conversation
conversation.messages.all()

# Get only assistant responses
conversation.messages.filter(role='assistant')
```

---

## 🎯 Sample Queries

### Active Paying Users
```sql
SELECT DISTINCT user_id FROM payments 
WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'
```

### Most Popular Briefs
```sql
SELECT brief_id, COUNT(*) as interactions 
FROM ai_assistant_conversation 
WHERE brief_id IS NOT NULL 
GROUP BY brief_id 
ORDER BY interactions DESC
```

### Revenue This Month
```sql
SELECT SUM(amount_cents) / 100.0 as revenue_dollars 
FROM payments 
WHERE status = 'completed' 
AND created_at >= DATE_TRUNC('month', NOW())
```

### Pending Payments
```sql
SELECT id, user_id, amount_cents 
FROM payments 
WHERE status = 'pending' 
AND created_at < NOW() - INTERVAL '1 day'
```

---

## 📊 Indexes Recommendation

For optimal query performance, add indexes on:

```sql
-- Search & Filter
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_brief_slug ON briefs(slug);
CREATE INDEX idx_brief_user_id ON briefs(user_id);
CREATE INDEX idx_payment_user_id ON payments(user_id);
CREATE INDEX idx_payment_status ON payments(status);
CREATE INDEX idx_conversation_user_id ON ai_assistant_conversation(user_id);
CREATE INDEX idx_message_conversation_id ON ai_assistant_message(conversation_id);

-- Time-based queries
CREATE INDEX idx_brief_created_at ON briefs(created_at);
CREATE INDEX idx_payment_created_at ON payments(created_at);
CREATE INDEX idx_message_created_at ON ai_assistant_message(created_at);
```

---

## 🔄 Migration Notes

All tables use Django migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

Current migrations:
- `0001_initial` - Initial schema creation
- All foreign keys set `on_delete=models.CASCADE`

---

**Last Updated:** March 15, 2026  
**Database:** PostgreSQL (recommended for Django with UUID support)  
**ORM:** Django 6.0 with Custom User Model
