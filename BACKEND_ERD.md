```mermaid
erDiagram
    USER ||--o{ BRIEF : creates
    USER ||--o{ PAYMENT : makes
    USER ||--o{ CONVERSATION : has
    BRIEF ||--o{ CONVERSATION : "analyzed_by"
    CONVERSATION ||--o{ MESSAGE : contains

    USER {
        uuid id PK
        string email UK
        string name
        string avatar_url
        string google_id UK
        enum plan "free|pro|agency"
        string stripe_customer_id
        string stripe_subscription_id
        string logo_url
        string freelancer_type
        int hourly_rate
        boolean is_active
        boolean is_staff
        datetime created_at
        datetime updated_at
    }

    BRIEF {
        uuid id PK
        uuid user_id FK "→ USER"
        string slug UK
        json raw_input "client_message, freelancer_type, hourly_rate"
        json generated_data "scope, deliverables, pricing, timeline"
        boolean is_approved
        datetime approved_at
        string approver_ip
        datetime created_at
        datetime updated_at
    }

    PAYMENT {
        uuid id PK
        uuid user_id FK "→ USER"
        string stripe_session_id UK
        string stripe_subscription_id
        enum status "pending|completed|failed|cancelled"
        int amount_cents
        string plan "pro|agency"
        datetime created_at
        datetime completed_at
        json metadata "stripe_data"
    }

    STRIPE_EVENT {
        string stripe_event_id PK
        string event_type "payment_intent.succeeded, etc"
        json data "complete_event_payload"
        boolean processed
        datetime created_at
    }

    CONVERSATION {
        uuid id PK
        uuid user_id FK "→ USER"
        uuid brief_id FK "→ BRIEF (nullable)"
        enum type "chat|brief_analysis|price_recommendation|client_communication"
        string title
        datetime created_at
        datetime updated_at
    }

    MESSAGE {
        uuid id PK
        uuid conversation_id FK "→ CONVERSATION"
        enum role "user|assistant"
        string content "supports_streaming"
        datetime created_at
    }
```

## Database Schema Overview

### Key Stats
- **6 Tables** total
- **3 Foreign Keys** for relationships
- **4 UUID Primary Keys** (better security)
- **Multiple Enums** for type safety
- **JSON Fields** for flexible storage

### Primary Relationships
- 1 User → Many Briefs
- 1 User → Many Payments  
- 1 User → Many Conversations
- 1 Brief → Many Conversations
- 1 Conversation → Many Messages

### Core Features
✅ Plan-based access control (Free/Pro/Agency)  
✅ Stripe payment integration with webhooks  
✅ AI conversation history with multiple modes  
✅ Brief generation and client approval  
✅ Audit trail (created_at, updated_at)  
✅ IPv6 support for approver tracking  

### Query Examples

**Get user's briefs:**
```sql
SELECT * FROM briefs WHERE user_id = {user_id} ORDER BY created_at DESC
```

**Get conversation with all messages:**
```sql
SELECT m.* FROM messages m 
WHERE m.conversation_id = {conversation_id} 
ORDER BY m.created_at ASC
```

**Get completed payments (revenue):**
```sql
SELECT SUM(amount_cents)/100 as revenue 
FROM payments 
WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'
```

**Get brief statistics:**
```sql
SELECT 
  COUNT(*) as total_briefs,
  COUNT(CASE WHEN is_approved THEN 1 END) as approved,
  COUNT(CASE WHEN is_approved = false THEN 1 END) as pending
FROM briefs
WHERE user_id = {user_id}
```
