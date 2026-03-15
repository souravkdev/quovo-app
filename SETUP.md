# Quovo SaaS - Setup & Deployment Guide

## Project Overview
Quovo is an AI-powered project brief generator for freelancers. Built with:
- **Frontend**: Next.js 14 with TypeScript & Tailwind CSS
- **Backend**: Django 6.0 with Django REST Framework
- **Database**: PostgreSQL
- **AI**: OpenAI API (GPT-4o)
- **Payments**: Stripe

---

## Architecture

### Backend API (Django)
```
/users/          - Authentication (GitHub OAuth 2.0, JWT tokens)
/briefs/         - Project brief generation & management
/payments/       - Stripe checkout & webhook handling
```

### Frontend (Next.js)
```
/                - Landing page
/auth/callback   - GitHub OAuth callback
/brief/new       - Create new brief (auth required)
/brief/[slug]    - Public brief view & approval
/dashboard       - User briefs list (auth required)
/pricing         - Pricing plans & upgrade
```

---

## Local Development Setup

### Prerequisites
- Python 3.14
- Node.js 18+
- PostgreSQL
- OpenAI API key
- Stripe test credentials

### Backend Setup

1. **Create virtual environment and install dependencies**
```bash
cd backend
python3.14 -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt
```

2. **Configure environment variables** (`.env`)
```bash
SECRET_KEY=your-django-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/quovo
OPENAI_API_KEY=sk-proj-your-key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRO_PRICE_ID=price_from_stripe
STRIPE_AGENCY_PRICE_ID=price_from_stripe
FRONTEND_URL=http://localhost:3000
GITHUB_CLIENT_ID=your-github-oauth-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret
```

3. **Create PostgreSQL database**
```bash
createdb quovo
```

4. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser**
```bash
python manage.py createsuperuser
```

6. **Start development server**
```bash
python manage.py runserver
# API available at http://localhost:8000
# Admin at http://localhost:8000/admin
```

---

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure environment variables** (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Start development server**
```bash
npm run dev
# Frontend available at http://localhost:3000
```

---

## Feature Checklist

### ✅ Authentication
- [x] GitHub OAuth 2.0 integration
- [x] JWT token auth (access + refresh)
- [x] Protected routes with auth checks
- [x] Automatic token refresh on 401

### ✅ Brief Generation (Core Feature)
- [x] AI-powered brief creation from messy client messages
- [x] OpenAI GPT-4o with JSON structured output
- [x] Plan limits enforced (5/month for free)
- [x] Brief approval with timestamped records
- [x] Public shareable links

### ✅ Payments
- [x] Stripe checkout session creation
- [x] Recurring subscriptions (Pro $12/mo, Agency $29/mo)
- [x] Webhook handlers for subscription events
- [x] Automatic plan upgrades/downgrades

### ✅ User Interface
- [x] Landing page with features
- [x] Dark theme (blue-black) throughout
- [x] Responsive design (mobile, tablet, desktop)
- [x] Loading states and error handling
- [x] Smooth transitions and animations

---

## API Endpoints

### Authentication (users/)
```
POST   /auth/token/refresh/       - Refresh JWT token
```

### Briefs (briefs/)
```
POST   /briefs/generate/          - Generate new brief (auth required)
GET    /briefs/                   - List user briefs (auth required)
GET    /briefs/public/<slug>/     - View brief by slug (public)
POST   /briefs/approve/<slug>/    - Approve brief (public)
```

### Payments (payments/)
```
POST   /payments/create-checkout/ - Create Stripe session (auth required)
POST   /payments/webhook/         - Stripe webhook (no auth)
```

---

## Stripe Setup

### 1. Create Stripe Account
- Go to https://stripe.com
- Create test mode account

### 2. Create Products & Prices
In Stripe Dashboard:
- Go to Products
- Create "Quovo Pro" product
  - Price: $12/month (recurring)
  - Copy Price ID → `STRIPE_PRO_PRICE_ID`
- Create "Quovo Agency" product
  - Price: $29/month (recurring)
  - Copy Price ID → `STRIPE_AGENCY_PRICE_ID`

### 3. Create Webhook Endpoint
- Go to Developers → Webhooks
- Click "Add endpoint"
- URL: `https://yourdomain.com/payments/webhook/`
- Events to listen:
  - `checkout.session.completed`
  - `customer.subscription.deleted`
- Copy Signing Secret → `STRIPE_WEBHOOK_SECRET`

### 4. Test Mode Keys
- Copy Secret Key → `STRIPE_SECRET_KEY`
- Use test credit cards:
  - `4242 4242 4242 4242` (success)
  - `4000 0000 0000 0002` (declined)

---

## Running in Production

### Backend Deployment

1. **Set DEBUG=False** in `.env`
2. **Use production database** (managed PostgreSQL)
3. **Configure ALLOWED_HOSTS** with your domain
4. **Set SECRET_KEY** to random secure string
5. **Use production Stripe keys** (not test)
6. **Configure CORS_ALLOWED_ORIGINS** with frontend domain
7. **Run migrations**
```bash
python manage.py migrate
```
8. **Collect static files**
```bash
python manage.py collectstatic --noinput
```

### Frontend Deployment

1. **Build Next.js**
```bash
npm run build
```
2. **Deploy to Vercel**
- Connect GitHub repository
- Set `NEXT_PUBLIC_API_URL` to production backend URL
- Deploy automatically on push

---

## Testing Checklist

### OAuth Flow
- [ ] Click "Sign in with GitHub"
- [ ] Authorizes and redirects to `/auth/callback`
- [ ] Tokens saved to localStorage
- [ ] Redirects to `/dashboard`

### Brief Generation
- [ ] Go to `/brief/new`
- [ ] Fill out form with test client message
- [ ] Click "Generate Brief"
- [ ] Loading spinner shows
- [ ] Redirect to `/brief/[slug]` on success

### Brief Approval
- [ ] View generated brief on public page
- [ ] Click "I approve this brief"
- [ ] Page shows green approval banner with timestamp
- [ ] Dashboard shows brief as "Approved"

### Plan Limits
- [ ] Create 5 briefs on free plan
- [ ] 6th attempt shows 402 error
- [ ] Can upgrade to Pro for unlimited

### Stripe Checkout
- [ ] Click "Upgrade to Pro" on pricing page
- [ ] Redirects to Stripe checkout
- [ ] Enter test card `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] User plan changes to "pro"
- [ ] Dashboard shows unlimited briefs available

### Webhook Handling
- [ ] Test webhook with Stripe CLI
```bash
stripe listen --forward-to localhost:8000/payments/webhook/
stripe trigger checkout.session.completed
```
- [ ] Event logged in Django admin
- [ ] User plan updated accordingly

---

## Monitoring & Debugging

### Backend Logs
```bash
# Watch logs in development
tail -f logs/debug.log

# Check specific model
python manage.py shell
>>> from users.models import User
>>> User.objects.all().values()
```

### Admin Panel
- URL: `http://localhost:8000/admin`
- View: Users, Briefs, Payments, Stripe Events
- Debug: Plan assignments, payment history

### Frontend Debugging
```bash
# Check tokens
console.log(localStorage.getItem('access_token'))

# Check API calls in Network tab
# Check Redux/state with React DevTools
```

---

## Common Issues & Solutions

### "CORS error" when calling API
**Solution**: Check `CORS_ALLOWED_ORIGINS` in Django settings includes frontend URL

### "OpenAI API error"
**Solution**: Verify `OPENAI_API_KEY` is valid and has sufficient balance

### "Brief approval not working"
**Solution**: Check webhook is configured and `STRIPE_WEBHOOK_SECRET` is correct

### "Tokens not persisting"
**Solution**: Verify localStorage is enabled and no private browsing mode

---

## File Structure

```
quovo-app/
├── backend/                      # Django project
│   ├── core/                    # Django settings
│   ├── users/                   # User auth app
│   ├── briefs/                  # Brief generation app
│   ├── payments/                # Stripe payments app
│   ├── manage.py
│   └── requirements.txt
├── frontend/                     # Next.js project
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── auth/
│   │   │   └── callback/       # OAuth callback
│   │   ├── brief/
│   │   │   ├── new/            # Create brief
│   │   │   └── [slug]/         # Public brief view
│   │   ├── dashboard/          # User dashboard
│   │   └── pricing/            # Pricing page
│   ├── components/
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── api.ts              # Axios client
│   │   └── utils.ts            # Helper functions
│   ├── package.json
│   └── tsconfig.json
└── PROGRESS.md                  # Build progress tracker
```

---

## Support & Resources

- **OpenAI Docs**: https://platform.openai.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Django Docs**: https://docs.djangoproject.com
- **Next.js Docs**: https://nextjs.org/docs

---

**Built with ❤️ by the Quovo team**
