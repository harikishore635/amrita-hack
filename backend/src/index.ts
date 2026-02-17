import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import pensionRoutes from './routes/pension';
import employerRoutes from './routes/employer';
import aiRoutes from './routes/ai';
import paymentRoutes from './routes/payment';
import blockchainRoutes from './routes/blockchain';

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
    console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.path}`);
    next();
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/pension', pensionRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'PensionChain API',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║         🏦 PensionChain API Server            ║
║═══════════════════════════════════════════════║
║  Status:    ✅ Running                        ║
║  Port:      ${String(PORT).padEnd(35)}║
║  Frontend:  ${(process.env.FRONTEND_URL || 'http://localhost:3000').padEnd(35)}║
║  Health:    http://localhost:${PORT}/api/health${' '.repeat(Math.max(0, 10 - String(PORT).length))}║
╚═══════════════════════════════════════════════╝

📋 Available Routes:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/send-otp
  POST   /api/auth/verify-otp
  POST   /api/auth/refresh-token
  DELETE /api/auth/logout

  GET    /api/user/profile
  PUT    /api/user/profile

  GET    /api/pension/balance
  GET    /api/pension/contributions
  POST   /api/pension/contribute
  GET    /api/pension/projection

  GET    /api/employer/employees
  POST   /api/employer/bulk-contribute

  POST   /api/ai/chat
  GET    /api/ai/suggestions

  POST   /api/payment/simulate
  GET    /api/payment/history

  POST   /api/blockchain/create-wallet
  GET    /api/blockchain/wallet-balance
  GET    /api/blockchain/transactions
  `);
});

export default app;
