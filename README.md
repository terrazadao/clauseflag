# ClauseFlag - Contract Clause Risk Scanner

**Spot risky contract clauses in 60 seconds. No legal jargon.**

## 🚀 Quick Start

This is a full-stack application with:
- **Mobile App**: React Native with Expo Go (iOS/Android)
- **Backend API**: Node.js/Express on Railway
- **Database**: Supabase (PostgreSQL + Storage)
- **AI Analysis**: OpenAI GPT-4
- **Payments**: Stripe
- **Email**: Resend

## 📁 Project Structure

```
/Volumes/Others/CFv01/Code/
├── clauseflag-mobile/          # React Native app (Expo)
│   ├── src/
│   │   ├── screens/            # All screen components
│   │   ├── navigation/         # Navigation setup
│   │   ├── services/           # API & Supabase services
│   │   ├── types/              # TypeScript types
│   │   └── constants/          # Colors, config
│   ├── App.tsx                 # Entry point
│   └── package.json
│
├── clauseflag-backend/         # Express API
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   └── utils/              # Utilities
│   ├── server.js               # Main server
│   └── package.json
│
└── supabase/
    └── migrations/             # Database schema
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- OpenAI API key
- Stripe account
- Resend account (for email)

### 1. Database Setup (Supabase)

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the migration file:
   ```sql
   -- Copy contents from /supabase/migrations/001_initial_schema.sql
   ```
4. Create a storage bucket named `contracts` (private)
5. Note down your:
   - Project URL
   - Anon/public key (for mobile)
   - Service role key (for backend)

### 2. Backend Setup (Railway)

```bash
cd /Volumes/Others/CFv01/Code/clauseflag-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Test locally
npm run dev
```

**Deploy to Railway:**
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables in Railway dashboard
5. Deploy: `railway up`

### 3. Mobile App Setup (Expo)

```bash
cd /Volumes/Others/CFv01/Code/clauseflag-mobile

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Start development server
npx expo start
```

**Run on device:**
- iOS: Press `i` (requires macOS + Xcode)
- Android: Press `a` (requires Android Studio)
- Or scan QR code with Expo Go app

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@clauseflag.com

# Frontend URL
FRONTEND_URL=http://localhost:8081
```

### Mobile (.env)
```env
EXPO_PUBLIC_API_URL=https://your-backend.railway.app/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 📱 App Flow

1. **Welcome** → User sees value proposition
2. **Jurisdiction** → Select US/EU/UAE
3. **Upload** → Pick PDF/DOCX file
4. **Payment** → Pay $10 via Stripe
5. **Loading** → AI analyzes contract
6. **Results** → View flagged clauses
7. **Email** → Send report to email

## 🤖 AI Analysis

The system analyzes these high-risk clause types:
- Termination
- Liability limitation
- Indemnity
- Auto-renewal
- Payment penalties
- Governing law
- Intellectual property
- Non-compete

Risk levels: Low 🟢 | Medium 🟠 | High 🔴

## 🛡️ Security

- 10MB file size limit
- PDF/DOCX only
- Rate limiting (100 req/15min)
- Row Level Security in Supabase
- No legal advice disclaimer everywhere

## 📝 Important Notes

1. **Not Legal Advice**: This tool flags potential concerns but is NOT a replacement for a lawyer.

2. **Jurisdiction**: Analysis is tuned for US/EU/UAE but doesn't replace local legal expertise.

3. **File Privacy**: Files are stored temporarily and auto-deleted after analysis.

4. **Pricing**: $10 per contract (can be changed in constants)

## 🚢 Deployment Checklist

- [ ] Supabase project created
- [ ] Database migrations run
- [ ] Storage bucket configured
- [ ] Backend deployed to Railway
- [ ] Environment variables set
- [ ] Stripe webhook configured
- [ ] Mobile app tested on device
- [ ] Email sending tested
- [ ] Legal disclaimer added
- [ ] App icons generated
- [ ] App store accounts prepared

## 🆘 Troubleshooting

**Mobile build fails:**
- Run `npx expo prebuild --clean`
- Check Node version (18+)

**Backend not connecting:**
- Verify Supabase URL and keys
- Check Railway deployment logs

**Stripe payments failing:**
- Confirm webhook secret is set
- Test with Stripe test cards

**AI not responding:**
- Check OpenAI API key
- Monitor API usage/limits

## 📞 Support

For issues or questions, check the troubleshooting section or review the code comments.

---

**Built with ❤️ for founders, freelancers, and SMBs.**
