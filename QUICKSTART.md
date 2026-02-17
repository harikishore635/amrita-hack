# 🚀 PensionChain - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npx tsx src/index.ts
```
✅ Backend running on **http://localhost:5000**

### Step 2: Start Frontend (Terminal 2)
```bash
npm run dev
```
✅ Frontend running on **http://localhost:3000**

---

## 🎮 Demo Flow

### 1. **Login as Worker**
- Go to http://localhost:3000/login
- Email: `ramesh@pension.com`
- Password: `worker123`
- Click **Login**

### 2. **View Dashboard**
- See your balance: **₹5,465** (from 30 days of contributions)
- Check projected retirement corpus: **₹8.2L**
- View recent transactions

### 3. **Make a Contribution**
- Click **"Contribute Now"** button
- Select amount: ₹10, ₹20, ₹50, or ₹100
- Click **"Contribute ₹X Now"**
- ✅ Watch employer match get added automatically (50%)

### 4. **Chat with AI Advisor**
- Click **"AI Advisor"** in Quick Actions
- Ask: *"How much will I get at retirement?"*
- Get personalized response based on your real data
- Try in Hindi: *"मुझे रिटायरमेंट पर कितना मिलेगा?"*

### 5. **Login as Employer**
- Logout and go back to login
- Email: `employer@abc.com`
- Password: `employer123`

### 6. **Manage Employees**
- See 5 employees with their contribution stats
- Select employees (checkboxes)
- Choose bulk amount: ₹10, ₹50, or ₹100
- Click **"Process Contribution"**
- ✅ Watch contributions + matches get added for all selected employees

---

## 🧪 Test the APIs Directly

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Login & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ramesh@pension.com","password":"worker123"}'
```
Copy the `accessToken` from the response.

### Get Profile
```bash
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Make Contribution
```bash
curl -X POST http://localhost:5000/api/pension/contribute \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

### Chat with AI
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"message": "Should I increase my contribution?", "language": "en"}'
```

---

## 📱 Test Phone OTP Flow

### 1. Register New Account
- Go to http://localhost:3000/signup
- Enter email, password, phone number
- Click **"Create Account & Send OTP"**

### 2. Check Backend Console
- Look at Terminal 1 (backend)
- You'll see: `📱 OTP for +91XXXXXXXXXX: 123456`

### 3. Enter OTP
- Type the 6-digit code from console
- Click **"Verify & Continue"**

---

## 🎯 Key Features to Demo

### Worker Features
✅ Real-time balance tracking  
✅ Contribution history with pagination  
✅ Employer matching (auto-calculated)  
✅ Retirement projections (3 scenarios)  
✅ AI advisor with multilingual support  
✅ Portfolio allocation display  
✅ Simulated UPI payments  

### Employer Features
✅ Employee list with stats  
✅ Bulk contribution processing  
✅ Auto employer matching  
✅ Real-time updates  
✅ Compliance tracking  

### AI Features
✅ Context-aware responses (knows your balance, age, projections)  
✅ Multilingual (Hindi, Tamil, Telugu, Marathi, Bengali, English)  
✅ Quick question templates  
✅ Fallback responses when API unavailable  

---

## 🔍 What to Show Judges

### 1. **Authentication Flow**
- Show email + password registration
- Demonstrate phone OTP (console-logged)
- Show JWT token refresh (inspect Network tab)

### 2. **Real-time Data**
- Make a contribution
- Watch balance update immediately
- Show employer match auto-added
- Check transaction appears in history

### 3. **AI Integration**
- Ask about retirement planning
- Show how AI knows your actual balance
- Switch language to Hindi/Tamil
- Show fallback responses work

### 4. **Employer Dashboard**
- Show employee management
- Demonstrate bulk contribution
- Show auto-matching calculation
- View real-time stats update

### 5. **Database**
- Open Prisma Studio: `cd backend && npx prisma studio`
- Show real data in SQLite database
- Demonstrate relationships (User → Contributions)

### 6. **Smart Contract**
- Show `contracts/PensionVault.sol`
- Explain contribution, matching, withdrawal logic
- Mention Polygon Amoy testnet deployment

---

## 🎨 UI/UX Highlights

- **Dark Mode**: Sleek black background with amber accents
- **Glassmorphism**: Cards with backdrop blur
- **Micro-animations**: Hover effects, loading states
- **Responsive**: Works on mobile, tablet, desktop
- **Real-time Updates**: No page refresh needed
- **Error Handling**: User-friendly error messages
- **Loading States**: Spinners and skeleton screens

---

## 📊 Demo Metrics

**Backend**:
- 20+ API endpoints
- 6 database models
- JWT auth with auto-refresh
- Google Gemini AI integration
- Simulated payment flow

**Frontend**:
- 5 fully integrated pages
- Auth context for global state
- API client with auto token refresh
- Real-time data updates

**Demo Data**:
- 2 accounts (worker + employer)
- 30 days of transaction history
- 5 employees
- Realistic amounts

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
cd backend
rm -rf node_modules
npm install
npx prisma generate
npx prisma db push
npx tsx src/seed.ts
```

### Frontend not loading?
```bash
rm -rf node_modules .next
npm install
```

### Can't login?
- Check backend is running on port 5000
- Check frontend `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Try demo accounts: `ramesh@pension.com` / `worker123`

### OTP not showing?
- OTPs are logged to **backend console** (Terminal 1)
- Look for: `📱 OTP for +91XXXXXXXXXX: 123456`

---

## 🎉 You're Ready!

**Both servers running?** ✅  
**Demo accounts work?** ✅  
**AI responding?** ✅  
**Contributions processing?** ✅  

**→ Visit http://localhost:3000 and start the demo!**

---

## 💡 Pro Tips for Demo

1. **Keep backend console visible** - Shows OTPs and API logs
2. **Use browser DevTools** - Show Network tab for API calls
3. **Prepare questions for AI** - "How much at retirement?", "Can I withdraw early?"
4. **Show both accounts** - Worker dashboard + Employer dashboard
5. **Highlight auto-matching** - Emphasize employer contribution
6. **Mention scalability** - SQLite → PostgreSQL, Console OTP → Twilio

---

**Good luck with your hackathon presentation! 🚀**
