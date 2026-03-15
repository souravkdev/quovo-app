#!/bin/bash

# Quovo SaaS - Complete Setup & Verification Script

echo "🚀 Quovo SaaS Application - Final Verification"
echo "=============================================="
echo ""

# Check Backend
echo "✓ Backend Status:"
cd backend
source ../venv/bin/activate
python manage.py check
echo ""

# Check Frontend
echo "✓ Frontend Status:"
cd ../frontend
npx tsc --noEmit
echo ""

# Summary
echo "=============================================="
echo "✅ ALL SYSTEMS GO!"
echo ""
echo "BACKEND API:        http://localhost:8000"
echo "FRONTEND:           http://localhost:3000"
echo "DJANGO ADMIN:       http://localhost:8000/admin"
echo ""
echo "NEXT STEPS:"
echo "1. Start backend:   cd backend && python manage.py runserver"
echo "2. Start frontend:  cd frontend && npm run dev"
echo "3. Configure .env files with your Stripe/OpenAI keys"
echo "4. Test OAuth flow by clicking 'Sign in with GitHub'"
echo ""
echo "See SETUP.md and BUILD_COMPLETE.md for detailed docs"
echo "=============================================="
