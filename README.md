# 🏦 PensionChain - Blockchain Pension for India's Informal Workers

A complete full-stack blockchain pension application built for India's 450 million informal workers. Start saving with just ₹10/day.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema (SQLite)
npx prisma db push

# Seed demo data
npx tsx src/seed.ts

# Start backend server
npx tsx src/index.ts
```

Backend will run on **http://localhost:5000**

### 2. Frontend Setup

```bash
# From project root
npm install

# Start frontend dev server
npm run dev
```

Frontend will run on **http://localhost:3000**

---

## 🎯 Demo Accounts

### Worker Account
- **Email**: `ramesh@pension.com`
- **Password**: `worker123`
- **Features**: Dashboard, AI Chat, Contributions, Portfolio

### Employer Account
- **Email**: `employer@abc.com`
- **Password**: `employer123`
- **Features**: Employee management, Bulk contributions, Reports

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Context API for state management

**Backend**
- Express.js + TypeScript
- Prisma ORM
- SQLite (dev) → PostgreSQL (production)
- JWT Authentication
- Google Gemini AI API

**Blockchain**
- Solidity smart contracts
- Polygon Amoy Testnet
- ethers.js v6

---

## 📁 Project Structure

```
amrita-hack/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.ts      # Register, login, OTP
│   │   │   ├── user.ts      # Profile management
│   │   │   ├── pension.ts   # Contributions, balance
│   │   │   ├── employer.ts  # Employee management
│   │   │   ├── ai.ts        # Gemini AI chat
│   │   │   ├── payment.ts   # Simulated UPI
│   │   │   └── blockchain.ts # Wallet operations
│   │   ├── middleware/
│   │   │   └── auth.ts      # JWT middleware
│   │   ├── lib/
│   │   │   └── prisma.ts    # Database client
│   │   ├── index.ts         # Express server
│   │   └── seed.ts          # Demo data
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── .env                 # Environment variables
│   └── package.json
│
├── src/
│   ├── app/
│   │   ├── login/           # Login page
│   │   ├── signup/          # Registration flow
│   │   ├── dashboard/       # Worker dashboard
│   │   ├── employer/        # Employer dashboard
│   │   ├── chat/            # AI advisor
│   │   └── layout.tsx       # Root layout with AuthProvider
│   ├── context/
│   │   └── AuthContext.tsx  # Global auth state
│   ├── lib/
│   │   └── api.ts           # API client with auto-refresh
│   └── app/globals.css      # Utility classes
│
├── contracts/
│   └── PensionVault.sol     # Smart contract
│
└── README.md
```

---

## 🔑 Key Features Implemented

### ✅ Authentication
- [x] Email + Password registration
- [x] Phone OTP verification (console-logged for demo)
- [x] JWT access tokens (15min) + refresh tokens (7d)
- [x] Auto token refresh on API calls
- [x] Secure password hashing (bcrypt)

### ✅ Pension Management
- [x] Real-time balance tracking
- [x] Contribution history with pagination
- [x] Employer matching (auto-calculated)
- [x] Yield simulation (DeFi returns)
- [x] Retirement projections (3 scenarios)
- [x] Portfolio allocation display

### ✅ AI Advisory
- [x] Google Gemini 2.0 Flash integration
- [x] Context-aware responses (user's pension data)
- [x] Multilingual support (Hindi, Tamil, Telugu, Marathi, Bengali, English)
- [x] Fallback responses when API unavailable
- [x] Quick question templates

### ✅ Payment System
- [x] Simulated UPI payment flow
- [x] Transaction history
- [x] Payment status tracking
- [x] Easy to swap for Razorpay later

### ✅ Employer Features
- [x] Employee list with contribution stats
- [x] Bulk contribution processing
- [x] Auto employer matching
- [x] Real-time updates

### ✅ Blockchain
- [x] Wallet creation (ethers.js)
- [x] PensionVault smart contract (Solidity)
- [x] On-chain balance queries
- [x] Transaction tracking

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/register       # Create account
POST   /api/auth/login          # Login with email/password
POST   /api/auth/send-otp       # Send phone OTP
POST   /api/auth/verify-otp     # Verify OTP
POST   /api/auth/refresh-token  # Refresh access token
DELETE /api/auth/logout         # Logout
```

### User
```
GET    /api/user/profile        # Get profile + stats
PUT    /api/user/profile        # Update profile
```

### Pension
```
GET    /api/pension/balance     # Get balance + aggregates
GET    /api/pension/contributions  # Transaction history
POST   /api/pension/contribute  # Make contribution
GET    /api/pension/projection  # Retirement projections
```

### AI
```
POST   /api/ai/chat            # Chat with AI advisor
GET    /api/ai/suggestions     # Get personalized tips
```

### Payment
```
POST   /api/payment/simulate   # Simulate UPI payment
GET    /api/payment/history    # Payment history
```

### Blockchain
```
POST   /api/blockchain/create-wallet    # Create wallet
GET    /api/blockchain/wallet-balance   # Get balance
GET    /api/blockchain/transactions     # Transaction list
```

### Employer
```
GET    /api/employer/employees          # List employees
POST   /api/employer/bulk-contribute    # Bulk contribution
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="pensionchain-jwt-secret"
JWT_REFRESH_SECRET="pensionchain-refresh-secret"
GEMINI_API_KEY="AIzaSyDGpiyW5eFvb_GLZBVlB7ZtGUhBj0XhJCg"
PORT=5000
FRONTEND_URL="http://localhost:3000"

# Blockchain (optional for demo)
POLYGON_RPC_URL=""
DEPLOYER_PRIVATE_KEY=""
PENSION_VAULT_ADDRESS=""
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📊 Database Schema

```prisma
User {
  id, email, password, name, phone, phoneVerified
  age, monthlyIncome, riskProfile, role, walletAddress
  contributions[], chatHistory[], employer?, employedAt?
}

Employer {
  id, companyName, gstNumber, matchPercentage
  user, employees[], contributions[]
}

Contribution {
  id, userId, amount, employerMatch, type
  paymentMethod, paymentStatus, txHash
  user, employer
}

OtpVerification {
  id, phone, otp, expiresAt, verified
}

ChatMessage {
  id, userId, role, content, language
}

RefreshToken {
  id, token, userId, expiresAt
}
```

---

## 🤖 AI Integration

The AI advisor uses **Google Gemini 2.0 Flash** with:
- User's pension data as context (balance, age, projections)
- Recent chat history for continuity
- Multilingual support
- Fallback responses for offline mode

Example prompt structure:
```
System: You are PensionChain AI Advisor...
User Context: Balance: ₹5000, Age: 36, Projected: ₹8L...
User: How much will I get at retirement?
AI: Based on your current ₹15/day contribution...
```

---

## 🔗 Smart Contract

**PensionVault.sol** features:
- Worker contributions
- Employer matching
- Emergency withdrawals (10% penalty, 50% max)
- Retirement withdrawals (after 25 years)
- Employer registry

Deploy to Polygon Amoy:
```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Deploy
npx hardhat run scripts/deploy.js --network amoy
```

---

## 🎨 UI/UX Highlights

- **Dark mode** with glassmorphism
- **Gradient accents** (amber/gold theme)
- **Micro-animations** on hover/click
- **Responsive design** (mobile-first)
- **Real-time updates** after actions
- **Loading states** for all async operations
- **Error handling** with user-friendly messages

---

## 🧪 Testing

### Manual Testing Flow

1. **Register** → Create account with email + phone
2. **Verify OTP** → Check backend console for OTP
3. **Login** → Use demo account or new account
4. **Dashboard** → View balance, projections, transactions
5. **Contribute** → Simulate UPI payment
6. **AI Chat** → Ask about retirement planning
7. **Employer** → Login as employer, bulk contribute

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ramesh@pension.com","password":"worker123"}'

# Get profile (replace TOKEN)
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## 🚀 Production Deployment

### Backend
1. Switch to PostgreSQL (update `DATABASE_URL`)
2. Set strong JWT secrets
3. Configure real SMS provider (Twilio) for OTP
4. Add rate limiting
5. Enable HTTPS
6. Deploy to Railway/Render/AWS

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Set `NEXT_PUBLIC_API_URL` to production backend

### Blockchain
1. Deploy smart contract to Polygon Mainnet
2. Update `PENSION_VAULT_ADDRESS`
3. Fund deployer wallet with MATIC

---

## 📝 Next Steps (Post-Hackathon)

- [ ] Integrate Razorpay for real UPI payments
- [ ] Add Aadhaar eKYC (DigiLocker API)
- [ ] Implement withdrawal flow
- [ ] Add job switching feature
- [ ] Build mobile app (React Native)
- [ ] Add more AI features (voice input, financial planning)
- [ ] Implement notification system
- [ ] Add analytics dashboard for employers
- [ ] Multi-language UI (not just AI)
- [ ] Add referral system

---

## 🤝 Contributing

This is a hackathon project. For production use, please:
1. Conduct security audit
2. Add comprehensive tests
3. Implement proper error logging
4. Add monitoring (Sentry, DataDog)
5. Review smart contract security

---

## 📄 License

MIT License - Built for Amrita Hackathon 2026

---

## 👥 Team

Built with ❤️ for India's informal workers

**Tech Stack**: Next.js • Express • Prisma • Gemini AI • Solidity • Polygon

---

## 🆘 Troubleshooting

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npx prisma db push
```

### Frontend build errors
```bash
rm -rf node_modules .next package-lock.json
npm install
```

### Database issues
```bash
cd backend
rm -rf prisma/dev.db
npx prisma db push
npx tsx src/seed.ts
```

### OTP not showing
Check backend console - OTPs are logged there for demo purposes.

---

**🎉 You're all set! Visit http://localhost:3000 and login with the demo accounts.**
