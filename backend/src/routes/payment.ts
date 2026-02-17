import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();
router.use(authMiddleware);

// ─────────────────────────────────────────────
// POST /api/payment/simulate
// Simulated UPI payment for hackathon demo
// In production, replace with Razorpay/PhonePe SDK
// ─────────────────────────────────────────────
router.post('/simulate', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { amount, upiId } = req.body;

        if (!amount || amount < 1) {
            res.status(400).json({ error: 'Amount must be at least ₹1' });
            return;
        }

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate fake transaction ID
        const txId = `UPI${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Record the contribution
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { employedAt: true },
        });

        // Create worker contribution
        const contribution = await prisma.contribution.create({
            data: {
                userId,
                amount: parseFloat(amount),
                type: 'contribution',
                paymentMethod: 'upi',
                paymentStatus: 'completed',
                txHash: txId,
            },
        });

        // Auto employer match
        let matchAmount = 0;
        if (user?.employedAt) {
            matchAmount = parseFloat(amount) * (user.employedAt.matchPercentage / 100);
            await prisma.contribution.create({
                data: {
                    userId,
                    amount: matchAmount,
                    employerMatch: matchAmount,
                    type: 'match',
                    paymentMethod: 'employer',
                    paymentStatus: 'completed',
                    employerId: user.employedAt.id,
                    txHash: `MATCH-${txId}`,
                },
            });
        }

        console.log(`\n💰 UPI Payment Simulated: ₹${amount} from user ${user?.name} (${upiId || 'N/A'})`);
        console.log(`   Transaction ID: ${txId}`);
        console.log(`   Employer Match: ₹${matchAmount}\n`);

        res.json({
            success: true,
            message: 'Payment successful!',
            transaction: {
                id: txId,
                amount: parseFloat(amount),
                employerMatch: matchAmount,
                total: parseFloat(amount) + matchAmount,
                method: 'UPI',
                status: 'completed',
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error: any) {
        console.error('Payment simulation error:', error);
        res.status(500).json({ error: 'Payment failed' });
    }
});

// ─────────────────────────────────────────────
// GET /api/payment/history
// ─────────────────────────────────────────────
router.get('/history', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const payments = await prisma.contribution.findMany({
            where: { userId, paymentMethod: 'upi' },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        res.json({ payments });
    } catch (error: any) {
        console.error('Payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
});

export default router;
