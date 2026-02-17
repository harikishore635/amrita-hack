import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// ─────────────────────────────────────────────
// GET /api/user/profile
// ─────────────────────────────────────────────
router.get('/profile', async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                phoneVerified: true,
                age: true,
                monthlyIncome: true,
                riskProfile: true,
                role: true,
                walletAddress: true,
                currentEmployerId: true,
                createdAt: true,
                employedAt: {
                    select: {
                        id: true,
                        companyName: true,
                        matchPercentage: true,
                    },
                },
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Get contribution stats
        const contributions = await prisma.contribution.aggregate({
            where: { userId: req.userId, type: 'contribution' },
            _sum: { amount: true },
            _count: true,
        });

        const employerMatches = await prisma.contribution.aggregate({
            where: { userId: req.userId, type: 'match' },
            _sum: { amount: true },
        });

        const yields = await prisma.contribution.aggregate({
            where: { userId: req.userId, type: 'yield' },
            _sum: { amount: true },
        });

        const totalContributed = contributions._sum.amount || 0;
        const totalMatches = employerMatches._sum.amount || 0;
        const totalYields = yields._sum.amount || 0;
        const balance = totalContributed + totalMatches + totalYields;

        // Calculate projections
        const userAge = user.age || 30;
        const yearsToRetirement = Math.max(60 - userAge, 0);
        const avgDailyContribution = contributions._count > 0
            ? totalContributed / Math.max(1, Math.ceil((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)))
            : 15;
        const projectedCorpus = balance + (avgDailyContribution * 1.5 * 365 * yearsToRetirement * 1.08); // 8% annual growth
        const monthlyPension = projectedCorpus > 0 ? Math.round(projectedCorpus / (15 * 12)) : 0;

        res.json({
            ...user,
            stats: {
                balance: Math.round(balance),
                totalContributed: Math.round(totalContributed),
                totalMatches: Math.round(totalMatches),
                totalYields: Math.round(totalYields),
                contributionCount: contributions._count,
                projectedCorpus: Math.round(projectedCorpus),
                monthlyPension,
                daysUntilRetirement: yearsToRetirement * 365,
            },
        });
    } catch (error: any) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// ─────────────────────────────────────────────
// PUT /api/user/profile
// ─────────────────────────────────────────────
router.put('/profile', async (req: AuthRequest, res: Response) => {
    try {
        const { name, age, monthlyIncome, riskProfile } = req.body;

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                ...(name && { name }),
                ...(age && { age: parseInt(age) }),
                ...(monthlyIncome && { monthlyIncome }),
                ...(riskProfile && { riskProfile }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                age: true,
                monthlyIncome: true,
                riskProfile: true,
                role: true,
                walletAddress: true,
            },
        });

        res.json({ message: 'Profile updated', user });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
