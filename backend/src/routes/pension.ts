import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// ─────────────────────────────────────────────
// GET /api/pension/balance
// ─────────────────────────────────────────────
router.get('/balance', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { age: true, createdAt: true },
        });

        const contributions = await prisma.contribution.aggregate({
            where: { userId, type: 'contribution' },
            _sum: { amount: true },
        });

        const matches = await prisma.contribution.aggregate({
            where: { userId, type: 'match' },
            _sum: { amount: true },
        });

        const yields = await prisma.contribution.aggregate({
            where: { userId, type: 'yield' },
            _sum: { amount: true },
        });

        const withdrawals = await prisma.contribution.aggregate({
            where: { userId, type: 'withdrawal' },
            _sum: { amount: true },
        });

        const totalContributed = contributions._sum.amount || 0;
        const totalMatches = matches._sum.amount || 0;
        const totalYields = yields._sum.amount || 0;
        const totalWithdrawals = withdrawals._sum.amount || 0;
        const balance = totalContributed + totalMatches + totalYields - totalWithdrawals;

        // Today's contributions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayContributions = await prisma.contribution.aggregate({
            where: {
                userId,
                createdAt: { gte: today },
                type: { in: ['contribution', 'match'] },
            },
            _sum: { amount: true },
        });

        // This month's contributions
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthContributions = await prisma.contribution.aggregate({
            where: {
                userId,
                createdAt: { gte: monthStart },
                type: 'contribution',
            },
            _sum: { amount: true },
        });

        const monthMatches = await prisma.contribution.aggregate({
            where: {
                userId,
                createdAt: { gte: monthStart },
                type: 'match',
            },
            _sum: { amount: true },
        });

        res.json({
            balance: Math.round(balance),
            totalContributed: Math.round(totalContributed),
            totalMatches: Math.round(totalMatches),
            totalYields: Math.round(totalYields),
            totalWithdrawals: Math.round(totalWithdrawals),
            todayContribution: todayContributions._sum.amount || 0,
            monthContribution: monthContributions._sum.amount || 0,
            monthMatch: monthMatches._sum.amount || 0,
        });
    } catch (error: any) {
        console.error('Balance error:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// ─────────────────────────────────────────────
// GET /api/pension/contributions
// ─────────────────────────────────────────────
router.get('/contributions', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const contributions = await prisma.contribution.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const total = await prisma.contribution.count({ where: { userId } });

        res.json({
            contributions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('Contributions error:', error);
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
});

// ─────────────────────────────────────────────
// POST /api/pension/contribute
// ─────────────────────────────────────────────
router.post('/contribute', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { amount, paymentMethod = 'upi' } = req.body;

        if (!amount || amount < 1) {
            res.status(400).json({ error: 'Amount must be at least ₹1' });
            return;
        }

        // Get user's employer for matching
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
                paymentMethod,
                paymentStatus: 'completed',
            },
        });

        // Auto-create employer match if user has an employer
        let matchContribution = null;
        if (user?.employedAt) {
            const matchAmount = parseFloat(amount) * (user.employedAt.matchPercentage / 100);
            matchContribution = await prisma.contribution.create({
                data: {
                    userId,
                    amount: matchAmount,
                    employerMatch: matchAmount,
                    type: 'match',
                    paymentMethod: 'employer',
                    paymentStatus: 'completed',
                    employerId: user.employedAt.id,
                },
            });
        }

        // Simulate yield (small random amount for demo)
        const yieldAmount = parseFloat(amount) * 0.001 * (Math.random() * 3 + 1); // 0.1-0.4% instant yield
        await prisma.contribution.create({
            data: {
                userId,
                amount: parseFloat(yieldAmount.toFixed(2)),
                type: 'yield',
                paymentMethod: 'defi',
                paymentStatus: 'completed',
            },
        });

        res.status(201).json({
            message: 'Contribution successful!',
            contribution,
            employerMatch: matchContribution,
            totalAdded: parseFloat(amount) + (matchContribution?.amount || 0) + yieldAmount,
        });
    } catch (error: any) {
        console.error('Contribute error:', error);
        res.status(500).json({ error: 'Contribution failed' });
    }
});

// ─────────────────────────────────────────────
// GET /api/pension/projection
// ─────────────────────────────────────────────
router.get('/projection', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const contributions = await prisma.contribution.aggregate({
            where: { userId, type: { in: ['contribution', 'match', 'yield'] } },
            _sum: { amount: true },
            _count: true,
        });

        const balance = contributions._sum.amount || 0;
        const age = user.age || 30;
        const yearsToRetirement = Math.max(60 - age, 0);

        // Calculate average daily contribution
        const daysSinceJoin = Math.max(1, Math.ceil((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
        const avgDaily = contributions._count > 0 ? balance / daysSinceJoin : 15;

        // Projections for different scenarios
        const scenarios = [
            { label: 'Conservative (6%)', rate: 0.06 },
            { label: 'Moderate (8%)', rate: 0.08 },
            { label: 'Aggressive (12%)', rate: 0.12 },
        ];

        const projections = scenarios.map(({ label, rate }) => {
            const annualContribution = avgDaily * 365;
            let corpus = balance;
            for (let i = 0; i < yearsToRetirement; i++) {
                corpus = (corpus + annualContribution) * (1 + rate);
            }
            return {
                label,
                rate: rate * 100,
                corpus: Math.round(corpus),
                monthlyPension: Math.round(corpus / (15 * 12)),
            };
        });

        res.json({
            currentBalance: Math.round(balance),
            age,
            yearsToRetirement,
            avgDailyContribution: Math.round(avgDaily * 100) / 100,
            projections,
        });
    } catch (error: any) {
        console.error('Projection error:', error);
        res.status(500).json({ error: 'Failed to calculate projection' });
    }
});

export default router;
