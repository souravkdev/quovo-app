# CreatorBrief — Technical Documentation

> **Stack:** Next.js 14 (frontend) + FastAPI (backend) + PostgreSQL + OpenAI API + Stripe

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Full Project File Structure](#2-full-project-file-structure)
3. [Environment Setup](#3-environment-setup)
4. [Database Schema](#4-database-schema)
5. [Backend — FastAPI](#5-backend--fastapi)
6. [AI Service — OpenAI Integration](#6-ai-service--openai-integration)
7. [Authentication](#7-authentication)
8. [Stripe Payments Integration](#8-stripe-payments-integration)
9. [PDF Generation](#9-pdf-generation)
10. [Frontend — Next.js 14](#10-frontend--nextjs-14)
11. [API Reference](#11-api-reference)
12. [Deployment](#12-deployment)
13. [4-Week Build Roadmap](#13-4-week-build-roadmap)
14. [Dependencies & Versions](#14-dependencies--versions)

---

## 1. Tech Stack Overview

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) | SSR, great SEO for landing page, React ecosystem |
| Backend | FastAPI (Python) | Async support, auto API docs, fast to build |
| Database | PostgreSQL | Reliable relational DB, great with SQLAlchemy |
| ORM | SQLAlchemy (async) | Type-safe DB queries |
| AI | OpenAI GPT-4o | Best instruction-following, JSON mode |
| Auth | NextAuth.js | Google OAuth, easy session management |
| Payments | Stripe | Industry standard, excellent webhook support |
| PDF | ReportLab | Pure Python, no external dependencies |
| Frontend hosting | Vercel | Free tier, auto deploys from GitHub |
| Backend hosting | Railway | Simple Python deployment, free tier available |
| DB hosting | Supabase or Railway PostgreSQL | Managed PostgreSQL, free to start |

---

## 2. Full Project File Structure

```
creatorbrief/
│
├── backend/                              # Python FastAPI app
│   ├── main.py                           # App entry point, middleware, router registration
│   ├── requirements.txt                  # Python dependencies
│   ├── .env                              # Environment variables (never commit this)
│   ├── alembic.ini                       # DB migration config
│   ├── alembic/
│   │   └── versions/                     # Migration files
│   │
│   └── app/
│       ├── __init__.py
│       ├── config.py                     # Pydantic settings, reads from .env
│       ├── database.py                   # SQLAlchemy async engine + session
│       ├── auth.py                       # JWT token validation, get_current_user
│       │
│       ├── models/                       # SQLAlchemy ORM models
│       │   ├── __init__.py
│       │   ├── user.py                   # User table
│       │   └── brief.py                  # Brief table
│       │
│       ├── schemas/                      # Pydantic request/response models
│       │   ├── __init__.py
│       │   ├── user.py                   # UserCreate, UserResponse
│       │   └── brief.py                  # BriefInput, GeneratedBrief, BriefResponse
│       │
│       ├── routers/                      # API route handlers
│       │   ├── __init__.py
│       │   ├── auth.py                   # POST /auth/google, GET /auth/me
│       │   ├── briefs.py                 # POST /briefs/generate, GET /briefs, etc.
│       │   └── payments.py              # POST /payments/create-checkout, webhook
│       │
│       └── services/                     # Business logic
│           ├── __init__.py
│           ├── ai_service.py             # OpenAI prompt + response parsing
│           ├── pdf_service.py            # PDF generation with ReportLab
│           └── stripe_service.py         # Stripe checkout, subscription management
│
└── frontend/                             # Next.js 14 app
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── .env.local                        # Frontend env vars (never commit)
    │
    ├── app/                              # Next.js App Router
    │   ├── layout.tsx                    # Root layout, fonts, providers
    │   ├── page.tsx                      # Landing page (public)
    │   ├── globals.css
    │   │
    │   ├── dashboard/
    │   │   └── page.tsx                  # Brief history (auth required)
    │   │
    │   ├── brief/
    │   │   ├── new/
    │   │   │   └── page.tsx              # New brief form (auth required)
    │   │   └── [slug]/
    │   │       └── page.tsx              # Public shareable brief (no auth)
    │   │
    │   ├── pricing/
    │   │   └── page.tsx                  # Pricing page
    │   │
    │   └── api/
    │       └── auth/
    │           └── [...nextauth]/
    │               └── route.ts          # NextAuth handler
    │
    ├── components/
    │   ├── BriefForm.tsx                 # Input form for generating a brief
    │   ├── BriefPreview.tsx              # Renders the generated brief
    │   ├── BriefCard.tsx                 # Card in dashboard list
    │   ├── PricingCards.tsx              # Pricing plan comparison
    │   ├── Navbar.tsx
    │   └── ApproveButton.tsx             # Client-facing approval button
    │
    └── lib/
        ├── api.ts                        # Axios/fetch wrapper for backend calls
        └── utils.ts                      # Formatting helpers
```

---

## 3. Environment Setup

### Backend `.env`

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/creatorbrief

# OpenAI
OPENAI_API_KEY=sk-proj-...

# JWT (generate with: openssl rand -hex 32)
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCY_PRICE_ID=price_...

# App
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-here

# Google OAuth (from console.cloud.google.com)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Local Dev Setup

```bash
# 1. Clone and setup backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Run database migrations
alembic upgrade head

# 3. Start FastAPI server
uvicorn main:app --reload --port 8000

# 4. In a new terminal — setup frontend
cd frontend
npm install
npm run dev                     # Runs on http://localhost:3000
```

---

## 4. Database Schema

### Users table

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    name        VARCHAR(255),
    avatar_url  TEXT,
    google_id   VARCHAR(255) UNIQUE,
    plan        VARCHAR(20) DEFAULT 'free',   -- 'free', 'pro', 'agency'
    stripe_customer_id  VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    logo_url    TEXT,                          -- for PDF branding
    freelancer_type VARCHAR(100),              -- 'web developer', 'designer', etc.
    hourly_rate INTEGER,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Briefs table

```sql
CREATE TABLE briefs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug            VARCHAR(20) UNIQUE NOT NULL,   -- public URL token
    raw_input       JSONB NOT NULL,                -- original client message + context
    generated_data  JSONB NOT NULL,                -- full AI-generated brief content
    is_approved     BOOLEAN DEFAULT FALSE,
    approved_at     TIMESTAMP,
    approver_ip     VARCHAR(45),                   -- logged for records
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_briefs_user_id ON briefs(user_id);
CREATE INDEX idx_briefs_slug ON briefs(slug);
```

### SQLAlchemy Models

```python
# app/models/user.py
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    avatar_url = Column(String)
    google_id = Column(String(255), unique=True)
    plan = Column(String(20), default="free")
    stripe_customer_id = Column(String(255))
    stripe_subscription_id = Column(String(255))
    logo_url = Column(String)
    freelancer_type = Column(String(100))
    hourly_rate = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    briefs = relationship("Brief", back_populates="user", cascade="all, delete")
```

```python
# app/models/brief.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime

class Brief(Base):
    __tablename__ = "briefs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    slug = Column(String(20), unique=True, nullable=False, index=True)
    raw_input = Column(JSONB, nullable=False)
    generated_data = Column(JSONB, nullable=False)
    is_approved = Column(Boolean, default=False)
    approved_at = Column(DateTime, nullable=True)
    approver_ip = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="briefs")
```

---

## 5. Backend — FastAPI

### `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, briefs, payments
from app.database import create_tables
from app.config import settings

app = FastAPI(
    title="CreatorBrief API",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(briefs.router)
app.include_router(payments.router)

@app.on_event("startup")
async def startup():
    await create_tables()

@app.get("/health")
def health():
    return {"status": "ok"}
```

### `app/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_PRO_PRICE_ID: str
    STRIPE_AGENCY_PRICE_ID: str
    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
```

### `app/database.py`

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def create_tables():
    async with engine.begin() as conn:
        from app.models import user, brief  # noqa: import triggers registration
        await conn.run_sync(Base.metadata.create_all)
```

---

## 6. AI Service — OpenAI Integration

### `app/services/ai_service.py`

```python
from openai import AsyncOpenAI
from app.schemas.brief import BriefInput, GeneratedBrief
import json

client = AsyncOpenAI()  # reads OPENAI_API_KEY from environment automatically

SYSTEM_PROMPT = """
You are an expert freelance project manager. Convert the client's message into
a detailed, professional project brief.

Respond ONLY with valid JSON — no explanation, no markdown, just the JSON object.

Required schema:
{
  "project_title": "short descriptive title",
  "summary": "2-3 sentence plain English description of the project",
  "deliverables": ["specific item 1", "specific item 2", ...],
  "timeline_weeks": <integer>,
  "revision_rounds": <integer>,
  "price_estimate_min": <integer in USD>,
  "price_estimate_max": <integer in USD>,
  "assumptions": ["assumption 1", "assumption 2", ...],
  "out_of_scope": ["item not included 1", "item not included 2", ...],
  "next_steps": ["what the client needs to do next", ...]
}

Rules:
- deliverables: be specific and concrete (not "build website" but "5-page responsive website")
- assumptions: state what you're assuming to be true (e.g. "client provides all copy and images")
- out_of_scope: be explicit about what is NOT included to prevent scope creep
- price_estimate: use USD, realistic market rates
- timeline: never underestimate, add buffer
"""

async def generate_brief(input: BriefInput) -> GeneratedBrief:
    user_prompt = f"""
Client's message:
\"\"\"{input.client_message}\"\"\"

Freelancer context:
- Type: {input.freelancer_type or "general freelancer"}
- Hourly rate: ${input.hourly_rate}/hr if known, else {input.hourly_rate or "not provided"}
- Extra context: {input.extra_context or "none provided"}

Generate the professional project brief now.
"""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3,                            # lower = more consistent output
        response_format={"type": "json_object"}     # enforces JSON-only response
    )

    raw_json = response.choices[0].message.content
    data = json.loads(raw_json)
    return GeneratedBrief(**data)
```

### `app/schemas/brief.py`

```python
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class BriefInput(BaseModel):
    client_message: str = Field(..., min_length=10, max_length=5000)
    freelancer_type: Optional[str] = None
    hourly_rate: Optional[int] = None
    extra_context: Optional[str] = None

class GeneratedBrief(BaseModel):
    project_title: str
    summary: str
    deliverables: list[str]
    timeline_weeks: int
    revision_rounds: int
    price_estimate_min: int
    price_estimate_max: int
    assumptions: list[str]
    out_of_scope: list[str]
    next_steps: list[str]

class BriefResponse(BaseModel):
    id: UUID
    slug: str
    created_at: datetime
    is_approved: bool
    approved_at: Optional[datetime]
    data: GeneratedBrief

    class Config:
        from_attributes = True
```

---

## 7. Authentication

### Strategy

- Google OAuth via NextAuth on the frontend
- On successful Google login, frontend calls `POST /auth/google` with the Google ID token
- Backend verifies the token, creates or finds the user, returns a JWT
- All protected backend routes validate the JWT via `get_current_user` dependency

### `app/routers/auth.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from google.oauth2 import id_token
from google.auth.transport import requests
from app.database import get_db
from app.models.user import User
from app.auth import create_access_token
import os

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/google")
async def google_login(token: dict, db: AsyncSession = Depends(get_db)):
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token["credential"],
            requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_id = idinfo["sub"]
    email = idinfo["email"]

    # Find or create user
    user = await db.scalar(select(User).where(User.google_id == google_id))
    if not user:
        user = User(
            email=email,
            name=idinfo.get("name"),
            avatar_url=idinfo.get("picture"),
            google_id=google_id
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

### `app/auth.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.database import get_db
from app.models.user import User
from datetime import datetime, timedelta

bearer_scheme = HTTPBearer()

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
```

---

## 8. Stripe Payments Integration

### `app/routers/payments.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Request
from app.services.stripe_service import (
    create_checkout_session, handle_webhook_event
)
from app.auth import get_current_user
from app.models.user import User
from app.config import settings
import stripe

router = APIRouter(prefix="/payments", tags=["payments"])
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/create-checkout")
async def create_checkout(
    plan: str,  # "pro" or "agency"
    current_user: User = Depends(get_current_user)
):
    price_id = (
        settings.STRIPE_PRO_PRICE_ID if plan == "pro"
        else settings.STRIPE_AGENCY_PRICE_ID
    )
    url = await create_checkout_session(current_user, price_id)
    return {"checkout_url": url}

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    await handle_webhook_event(event)
    return {"received": True}
```

### `app/services/stripe_service.py`

```python
import stripe
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.database import AsyncSessionLocal
from app.config import settings

async def create_checkout_session(user: User, price_id: str) -> str:
    session = stripe.checkout.Session.create(
        customer_email=user.email,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=f"{settings.FRONTEND_URL}/dashboard?upgraded=true",
        cancel_url=f"{settings.FRONTEND_URL}/pricing",
        metadata={"user_id": str(user.id)}
    )
    return session.url

async def handle_webhook_event(event: dict):
    async with AsyncSessionLocal() as db:
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            user_id = session["metadata"]["user_id"]
            subscription_id = session["subscription"]

            # Determine plan from price ID
            subscription = stripe.Subscription.retrieve(subscription_id)
            price_id = subscription["items"]["data"][0]["price"]["id"]
            plan = "pro" if price_id == settings.STRIPE_PRO_PRICE_ID else "agency"

            user = await db.scalar(select(User).where(User.id == user_id))
            if user:
                user.plan = plan
                user.stripe_subscription_id = subscription_id
                await db.commit()

        elif event["type"] == "customer.subscription.deleted":
            subscription_id = event["data"]["object"]["id"]
            user = await db.scalar(
                select(User).where(User.stripe_subscription_id == subscription_id)
            )
            if user:
                user.plan = "free"
                user.stripe_subscription_id = None
                await db.commit()
```

---

## 9. PDF Generation

### `app/services/pdf_service.py`

```python
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from io import BytesIO
from app.schemas.brief import GeneratedBrief

def generate_brief_pdf(brief: GeneratedBrief, freelancer_name: str, logo_path: str = None) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            leftMargin=inch, rightMargin=inch,
                            topMargin=inch, bottomMargin=inch)

    styles = getSampleStyleSheet()
    purple = HexColor("#7F77DD")
    dark = HexColor("#1a1a2e")

    title_style = ParagraphStyle("Title", fontSize=22, textColor=dark, spaceAfter=6, fontName="Helvetica-Bold")
    h2_style = ParagraphStyle("H2", fontSize=13, textColor=purple, spaceAfter=4, spaceBefore=16, fontName="Helvetica-Bold")
    body_style = ParagraphStyle("Body", fontSize=10, textColor=dark, spaceAfter=4, leading=16)
    bullet_style = ParagraphStyle("Bullet", fontSize=10, textColor=dark, spaceAfter=3, leftIndent=16, bulletIndent=4)

    story = []

    # Title
    story.append(Paragraph(brief.project_title, title_style))
    story.append(Paragraph(f"Prepared by {freelancer_name}", body_style))
    story.append(Spacer(1, 0.2 * inch))

    # Summary
    story.append(Paragraph("Project Summary", h2_style))
    story.append(Paragraph(brief.summary, body_style))

    # Deliverables
    story.append(Paragraph("Deliverables", h2_style))
    for item in brief.deliverables:
        story.append(Paragraph(f"• {item}", bullet_style))

    # Timeline + Price table
    story.append(Paragraph("Timeline & Investment", h2_style))
    table_data = [
        ["Timeline", f"{brief.timeline_weeks} weeks"],
        ["Revisions", f"{brief.revision_rounds} rounds included"],
        ["Estimated Investment", f"${brief.price_estimate_min:,} – ${brief.price_estimate_max:,} USD"],
    ]
    t = Table(table_data, colWidths=[2.5 * inch, 4 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), HexColor("#EEEDFE")),
        ("TEXTCOLOR", (0, 0), (-1, -1), dark),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [HexColor("#FAFAFA"), HexColor("#FFFFFF")]),
        ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#CCCCCC")),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, HexColor("#DDDDDD")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(t)

    # Assumptions
    story.append(Paragraph("Assumptions", h2_style))
    for item in brief.assumptions:
        story.append(Paragraph(f"• {item}", bullet_style))

    # Out of scope
    story.append(Paragraph("Out of Scope", h2_style))
    for item in brief.out_of_scope:
        story.append(Paragraph(f"• {item}", bullet_style))

    # Next steps
    story.append(Paragraph("Next Steps", h2_style))
    for item in brief.next_steps:
        story.append(Paragraph(f"• {item}", bullet_style))

    doc.build(story)
    return buffer.getvalue()
```

### PDF endpoint (add to `routers/briefs.py`)

```python
from fastapi.responses import Response
from app.services.pdf_service import generate_brief_pdf

@router.get("/{brief_id}/pdf")
async def download_pdf(
    brief_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.plan == "free":
        raise HTTPException(status_code=402, detail="PDF export requires Pro plan")

    brief = await db.scalar(select(Brief).where(Brief.id == brief_id, Brief.user_id == current_user.id))
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    generated = GeneratedBrief(**brief.generated_data)
    pdf_bytes = generate_brief_pdf(generated, current_user.name or current_user.email)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=brief-{brief.slug}.pdf"}
    )
```

---

## 10. Frontend — Next.js 14

### `app/brief/new/page.tsx` — Brief creation form

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewBriefPage() {
  const router = useRouter();
  const { data: session } = useSession({ required: true });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client_message: "",
    freelancer_type: "",
    hourly_rate: "",
    extra_context: "",
  });

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/briefs/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          ...form,
          hourly_rate: form.hourly_rate ? parseInt(form.hourly_rate) : null,
        }),
      });

      if (res.status === 402) {
        router.push("/pricing?reason=limit");
        return;
      }

      const brief = await res.json();
      router.push(`/brief/${brief.slug}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">New project brief</h1>

      <label className="block mb-2 text-sm text-gray-600">
        Paste your client's message *
      </label>
      <textarea
        className="w-full border rounded-lg p-3 text-sm h-36 mb-4"
        placeholder="e.g. hey can you make me a website? something clean and modern, i sell handmade jewellery"
        value={form.client_message}
        onChange={(e) => setForm({ ...form, client_message: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 text-sm text-gray-600">Your role</label>
          <input
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="e.g. web developer"
            value={form.freelancer_type}
            onChange={(e) => setForm({ ...form, freelancer_type: e.target.value })}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-gray-600">Your hourly rate (USD)</label>
          <input
            className="w-full border rounded-lg p-2 text-sm"
            type="number"
            placeholder="e.g. 75"
            value={form.hourly_rate}
            onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
          />
        </div>
      </div>

      <label className="block mb-2 text-sm text-gray-600">Extra context (optional)</label>
      <input
        className="w-full border rounded-lg p-2 text-sm mb-6"
        placeholder="e.g. client mentioned a $2k budget, needs it by end of month"
        value={form.extra_context}
        onChange={(e) => setForm({ ...form, extra_context: e.target.value })}
      />

      <button
        onClick={handleSubmit}
        disabled={!form.client_message || loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? "Generating brief..." : "Generate brief →"}
      </button>
    </div>
  );
}
```

### `app/brief/[slug]/page.tsx` — Public shareable brief

```tsx
import { ApproveButton } from "@/components/ApproveButton";

async function getBrief(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/briefs/public/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function PublicBriefPage({ params }: { params: { slug: string } }) {
  const brief = await getBrief(params.slug);
  if (!brief) return <div className="p-8 text-center">Brief not found.</div>;

  const d = brief.data;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-1">{d.project_title}</h1>
      <p className="text-gray-500 text-sm mb-6">Generated project brief</p>

      <Section title="Summary"><p className="text-sm text-gray-700">{d.summary}</p></Section>
      <Section title="Deliverables"><BulletList items={d.deliverables} /></Section>
      <Section title="Timeline & investment">
        <InfoRow label="Timeline" value={`${d.timeline_weeks} weeks`} />
        <InfoRow label="Revisions" value={`${d.revision_rounds} rounds`} />
        <InfoRow label="Estimate" value={`$${d.price_estimate_min.toLocaleString()} – $${d.price_estimate_max.toLocaleString()} USD`} />
      </Section>
      <Section title="Assumptions"><BulletList items={d.assumptions} /></Section>
      <Section title="Out of scope"><BulletList items={d.out_of_scope} /></Section>
      <Section title="Next steps"><BulletList items={d.next_steps} /></Section>

      {!brief.is_approved ? (
        <ApproveButton slug={params.slug} />
      ) : (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Brief approved on {new Date(brief.approved_at).toLocaleDateString()}
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-8">Made with CreatorBrief</p>
    </div>
  );
}
```

---

## 11. API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/google` | No | Exchange Google token for JWT |
| GET | `/auth/me` | Yes | Get current user profile |
| POST | `/briefs/generate` | Yes | Generate a new brief via AI |
| GET | `/briefs` | Yes | List all user's briefs |
| GET | `/briefs/{id}` | Yes | Get a single brief (owner only) |
| GET | `/briefs/public/{slug}` | No | Get brief by public slug |
| POST | `/briefs/public/{slug}/approve` | No | Client approves brief |
| GET | `/briefs/{id}/pdf` | Yes (Pro) | Download brief as PDF |
| DELETE | `/briefs/{id}` | Yes | Delete a brief |
| POST | `/payments/create-checkout` | Yes | Create Stripe checkout session |
| POST | `/payments/webhook` | No (Stripe sig) | Handle Stripe events |

---

## 12. Deployment

### Frontend — Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd frontend
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL, NEXTAUTH_URL, NEXTAUTH_SECRET,
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

### Backend — Railway

1. Create new project on railway.app
2. Connect your GitHub repo
3. Set root directory to `/backend`
4. Add start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all `.env` variables in Railway dashboard
6. Add a PostgreSQL plugin — Railway auto-sets `DATABASE_URL`

### Stripe Webhook (production)

```bash
# Install Stripe CLI for local testing
stripe listen --forward-to localhost:8000/payments/webhook

# For production: add webhook in Stripe dashboard
# URL: https://your-railway-url.railway.app/payments/webhook
# Events to listen: checkout.session.completed, customer.subscription.deleted
```

---

## 13. 4-Week Build Roadmap

### Week 1 — Backend Core

- [ ] FastAPI project setup + folder structure
- [ ] PostgreSQL schema + SQLAlchemy models
- [ ] Alembic migrations configured
- [ ] OpenAI brief generation endpoint working
- [ ] JWT auth + Google token verification
- [ ] `POST /briefs/generate` tested in Swagger UI

### Week 2 — Frontend Core

- [ ] Next.js 14 project setup with Tailwind
- [ ] NextAuth Google OAuth working
- [ ] Brief creation form page
- [ ] Generated brief display (public slug page)
- [ ] Dashboard with brief list
- [ ] Client approval button working end-to-end

### Week 3 — Payments + PDF

- [ ] Stripe checkout session creation
- [ ] Stripe webhook handling (plan upgrade/downgrade)
- [ ] Free tier limit enforcement (5 briefs/month)
- [ ] PDF generation with ReportLab
- [ ] PDF download endpoint
- [ ] Pricing page in frontend

### Week 4 — Polish + Launch

- [ ] Landing page with live demo
- [ ] Onboarding flow (set freelancer type + rate on first login)
- [ ] Email notification on brief approval (use Resend.com — free tier)
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway
- [ ] Post to ProductHunt, Reddit, Twitter

---

## 14. Dependencies & Versions

### Backend `requirements.txt`

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
openai==1.30.0
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
alembic==1.13.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
stripe==9.9.0
reportlab==4.2.0
python-dotenv==1.0.1
pydantic[email]==2.7.1
pydantic-settings==2.2.1
google-auth==2.29.0
httpx==0.27.0
```

### Frontend `package.json` key dependencies

```json
{
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "next-auth": "^4.24.7",
    "axios": "^1.7.2",
    "tailwindcss": "^3.4.3",
    "@stripe/stripe-js": "^3.4.1"
  }
}
```

---

*Document version: 1.0 | Technical reference for CreatorBrief portfolio project*
