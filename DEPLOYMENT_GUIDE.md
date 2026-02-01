# ClauseFlag Deployment Guide

## 🎯 Overview
This guide will walk you through deploying ClauseFlag to production.

## 📋 Prerequisites
- Supabase account (free tier works)
- Railway account (free tier works)
- Stripe account (test mode for development)
- OpenAI API key
- Resend account (for email)
- Expo account (for mobile builds)

---

## Step 1: Supabase Setup

### 1.1 Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization and project name
4. Select region (choose closest to your users)
5. Create project and wait (takes ~2 minutes)

### 1.2 Run Migrations
1. In Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy contents from `/supabase/migrations/001_initial_schema.sql`
4. Click "Run"

### 1.3 Configure Storage
1. Go to Storage in sidebar
2. Create new bucket named `contracts`
3. Set to Private
4. Go to Policies tab
5. Add policies:
   - SELECT: `bucket_id = 'contracts'` (for authenticated users)
   - INSERT: `bucket_id = 'contracts'` (for authenticated users)

### 1.4 Get Credentials
1. Go to Project Settings → API
2. Copy:
   - Project URL (for SUPABASE_URL)
   - anon/public key (for SUPABASE_ANON_KEY)
   - service_role key (for SUPABASE_SERVICE_KEY - keep secret!)

---

## Step 2: Backend Deployment (Railway)

### 2.1 Prepare Code
```bash
cd /Volumes/Others/CFv01/Code/clauseflag-backend

# Create proper .env
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 2.2 Deploy
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
# Select "Empty Project"

# Deploy
railway up

# Get domain
railway domain
# Copy this URL for mobile app
```

### 2.3 Add Environment Variables in Railway Dashboard
1. Go to https://railway.app/dashboard
2. Click your project
3. Go to Variables tab
4. Add all variables from .env

### 2.4 Configure Stripe Webhook (Production)
1. In Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-railway-url/api/payment/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy signing secret to RAILWAY_STRIPE_WEBHOOK_SECRET

---

## Step 3: Mobile App Setup

### 3.1 Configure Environment
```bash
cd /Volumes/Others/CFv01/Code/clauseflag-mobile

# Create .env
cp .env.example .env

# Edit .env:
EXPO_PUBLIC_API_URL=https://your-railway-url/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Test Locally
```bash
npx expo start
```
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Or scan QR with Expo Go app

### 3.4 Build for Production

**iOS Build:**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure build
eas build:configure

# Build iOS
eas build --platform ios
```

**Android Build:**
```bash
eas build --platform android
```

---

## Step 4: Testing Checklist

### Backend Tests
```bash
# Health check
curl https://your-railway-url/health

# Upload test (use Postman or curl)
curl -X POST https://your-railway-url/api/upload \
  -F "file=@test.pdf" \
  -F "jurisdiction=us"
```

### Mobile Tests
- [ ] Welcome screen loads
- [ ] Jurisdiction selection works
- [ ] File picker opens
- [ ] Upload succeeds
- [ ] Stripe payment form appears
- [ ] Payment succeeds (use test card: 4242 4242 4242 4242)
- [ ] Analysis completes < 60 seconds
- [ ] Results display correctly
- [ ] Email sends successfully
- [ ] Error handling works

### Test Credit Cards (Stripe Test Mode)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date
- Any CVC
- Any ZIP

---

## Step 5: Pre-Launch Checklist

### Legal
- [ ] Disclaimer added to all screens
- [ ] Terms of service drafted
- [ ] Privacy policy drafted
- [ ] Not legal advice warning prominent

### Security
- [ ] Environment variables secure (not in code)
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting tested
- [ ] File upload limits enforced
- [ ] Stripe webhook secret set

### Performance
- [ ] Analysis completes in < 60 seconds
- [ ] File upload handles 10MB max
- [ ] App responsive on low-end devices
- [ ] Error messages clear and helpful

### Branding
- [ ] App icon generated (1024x1024)
- [ ] Splash screen created
- [ ] Colors match brand guidelines
- [ ] App store screenshots prepared

### Monitoring
- [ ] Sentry or similar error tracking added
- [ ] Analytics (PostHog/Amplitude) configured
- [ ] Logging configured on backend
- [ ] Health check endpoint working

---

## Step 6: App Store Submission

### iOS (App Store)
1. Create App Store Connect record
2. Generate certificates in Apple Developer Portal
3. Build with `eas build --platform ios`
4. Submit to App Store Connect
5. Fill out app details, screenshots
6. Submit for review (takes 1-2 days)

### Android (Google Play)
1. Create Google Play Console account ($25)
2. Create new app
3. Build with `eas build --platform android`
4. Upload AAB to Google Play
5. Fill out app details
6. Submit for review (takes 1-3 days)

---

## 🚨 Common Issues & Solutions

### Issue: Backend won't start
**Solution:** Check logs in Railway dashboard. Common issues:
- Missing environment variables
- Database connection failed
- Port already in use

### Issue: Mobile can't connect to backend
**Solution:**
- Verify EXPO_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

### Issue: Stripe payments fail
**Solution:**
- Verify STRIPE_PUBLISHABLE_KEY in mobile
- Check STRIPE_SECRET_KEY in backend
- Confirm webhook secret is set
- Test with Stripe test cards

### Issue: AI analysis slow
**Solution:**
- Check OpenAI API status
- Consider using GPT-3.5-turbo for faster responses
- Add caching for similar contracts
- Implement timeout handling

### Issue: Email not sending
**Solution:**
- Verify RESEND_API_KEY
- Check email domain verification in Resend
- Ensure FROM email is verified
- Check spam folders

---

## 📊 Post-Launch

### Day 1-7
- Monitor error logs hourly
- Check conversion rates
- Collect user feedback
- Fix critical bugs immediately

### Week 2-4
- Analyze usage patterns
- Optimize slow endpoints
- A/B test pricing if needed
- Add requested features

### Month 2+
- Plan subscription tiers
- Expand jurisdiction support
- Add more clause types
- Consider team features

---

## 🎉 You're Live!

Congratulations! Your ClauseFlag app is now deployed and ready to help users spot risky contract clauses.

**Next Steps:**
1. Share with first 50 users (founder communities, LinkedIn)
2. Collect testimonials
3. Iterate based on feedback
4. Scale infrastructure as needed

**Marketing Hooks:**
- "Before you sign that contract, scan it for red flags in 60 seconds"
- "Spot termination traps, liability landmines, and auto-renewal gotchas"
- "No legal jargon. Just red flags."

---

## 📞 Need Help?

Common resources:
- **Expo**: https://docs.expo.dev
- **Supabase**: https://supabase.com/docs
- **Railway**: https://docs.railway.app
- **Stripe**: https://stripe.com/docs
- **OpenAI**: https://platform.openai.com/docs

---

**Good luck with your launch! 🚀**
