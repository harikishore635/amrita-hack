import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// ─────────────────────────────────────────────
// GET /api/employer/employees
// ─────────────────────────────────────────────
router.get('/employees', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        // Get the employer record for this user
        const employer = await prisma.employer.findUnique({
            where: { userId },
            include: {
                employees: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        age: true,
                        riskProfile: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!employer) {
            res.status(403).json({ error: 'Not an employer account' });
            return;
        }

        // Get contribution data for each employee
        const employeesWithStats = await Promise.all(
            employer.employees.map(async (emp) => {
                const monthStart = new Date();
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);

                const monthlyContrib = await prisma.contribution.aggregate({
                    where: {
                        userId: emp.id,
                        createdAt: { gte: monthStart },
                        type: 'contribution',
                    },
                    _sum: { amount: true },
                });

                const monthlyMatch = await prisma.contribution.aggregate({
                    where: {
                        userId: emp.id,
                        createdAt: { gte: monthStart },
                        type: 'match',
                    },
                    _sum: { amount: true },
                });

                const totalContrib = await prisma.contribution.aggregate({
                    where: { userId: emp.id, type: 'contribution' },
                    _sum: { amount: true },
                });

                return {
                    ...emp,
                    monthlyContribution: monthlyContrib._sum.amount || 0,
                    monthlyMatch: monthlyMatch._sum.amount || 0,
                    totalContributed: totalContrib._sum.amount || 0,
                    status: (monthlyContrib._sum.amount || 0) > 0 ? 'active' : 'pending',
                };
            })
        );

        res.json({
            employer: {
                id: employer.id,
                companyName: employer.companyName,
                matchPercentage: employer.matchPercentage,
                totalEmployees: employer.employees.length,
                activeContributors: employeesWithStats.filter(e => e.status === 'active').length,
            },
            employees: employeesWithStats,
        });
    } catch (error: any) {
        console.error('Employer employees error:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// ─────────────────────────────────────────────
// POST /api/employer/bulk-contribute
// ─────────────────────────────────────────────
router.post('/bulk-contribute', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { employeeIds, amount } = req.body;

        const employer = await prisma.employer.findUnique({ where: { userId } });
        if (!employer) {
            res.status(403).json({ error: 'Not an employer account' });
            return;
        }

        if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
            res.status(400).json({ error: 'Employee IDs required' });
            return;
        }

        const perEmployee = parseFloat(amount) || 10;
        const matchAmount = perEmployee * (employer.matchPercentage / 100);

        // Create contributions for each employee
        const results = await Promise.all(
            employeeIds.map(async (empId: string) => {
                // Worker contribution
                const contribution = await prisma.contribution.create({
                    data: {
                        userId: empId,
                        amount: perEmployee,
                        type: 'contribution',
                        paymentMethod: 'employer',
                        paymentStatus: 'completed',
                        employerId: employer.id,
                    },
                });

                // Employer match
                const match = await prisma.contribution.create({
                    data: {
                        userId: empId,
                        amount: matchAmount,
                        employerMatch: matchAmount,
                        type: 'match',
                        paymentMethod: 'employer',
                        paymentStatus: 'completed',
                        employerId: employer.id,
                    },
                });

                return { employeeId: empId, contribution, match };
            })
        );

        res.json({
            message: `Bulk contribution processed for ${results.length} employees`,
            totalAmount: (perEmployee + matchAmount) * results.length,
            results,
        });
    } catch (error: any) {
        console.error('Bulk contribute error:', error);
        res.status(500).json({ error: 'Bulk contribution failed' });
    }
});

export default router;
