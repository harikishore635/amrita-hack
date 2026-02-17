import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    authMiddleware,
    AuthRequest,
} from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name, phone } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required' });
            return;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: 'User with this email already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone: phone || null,
            },
        });

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        // Generate OTP for phone verification if phone provided
        if (phone) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await prisma.otpVerification.create({
                data: {
                    phone,
                    otp,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                },
            });
            console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
        }

        res.status(201).json({
            message: 'Registration successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                phoneVerified: user.phoneVerified,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                phoneVerified: user.phoneVerified,
                role: user.role,
                age: user.age,
                monthlyIncome: user.monthlyIncome,
                riskProfile: user.riskProfile,
                walletAddress: user.walletAddress,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ─────────────────────────────────────────────
// POST /api/auth/send-otp
// ─────────────────────────────────────────────
router.post('/send-otp', async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            res.status(400).json({ error: 'Phone number is required' });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.otpVerification.create({
            data: {
                phone,
                otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        // In production, send via Twilio SMS. For hackathon, log to console.
        console.log(`\n📱 OTP for ${phone}: ${otp}\n`);

        res.json({ message: 'OTP sent successfully (check backend console)' });
    } catch (error: any) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// ─────────────────────────────────────────────
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────
router.post('/verify-otp', async (req: Request, res: Response) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            res.status(400).json({ error: 'Phone and OTP are required' });
            return;
        }

        const record = await prisma.otpVerification.findFirst({
            where: {
                phone,
                otp,
                verified: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!record) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }

        // Mark OTP as verified
        await prisma.otpVerification.update({
            where: { id: record.id },
            data: { verified: true },
        });

        // Mark user phone as verified
        await prisma.user.updateMany({
            where: { phone },
            data: { phoneVerified: true },
        });

        res.json({ message: 'Phone verified successfully' });
    } catch (error: any) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'OTP verification failed' });
    }
});

// ─────────────────────────────────────────────
// POST /api/auth/refresh-token
// ─────────────────────────────────────────────
router.post('/refresh-token', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token is required' });
            return;
        }

        // Verify token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            res.status(401).json({ error: 'Invalid refresh token' });
            return;
        }

        // Check if token exists in DB
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            res.status(401).json({ error: 'Refresh token expired' });
            return;
        }

        // Get user
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user.id, user.role);

        res.json({ accessToken: newAccessToken });
    } catch (error: any) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: 'Token refresh failed' });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/auth/logout
// ─────────────────────────────────────────────
router.delete('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        }

        // Delete all refresh tokens for this user
        await prisma.refreshToken.deleteMany({ where: { userId: req.userId } });

        res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

export default router;
