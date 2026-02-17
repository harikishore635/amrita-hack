import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Seed script to populate the database with 4 demo users
 * 2 Employers + 2 Workers with full transaction history
 * Run with: npm run db:seed
 */
async function seed() {
    console.log('🌱 Seeding database with 4 users...\n');

    const employerPassword = await bcrypt.hash('employer123', 12);
    const workerPassword = await bcrypt.hash('worker123', 12);

    // ═══════════════════════════════════════════
    // EMPLOYER 1: ABC Construction
    // ═══════════════════════════════════════════
    const employer1User = await prisma.user.upsert({
        where: { email: 'employer1@pensionchain.com' },
        update: {},
        create: {
            email: 'employer1@pensionchain.com',
            password: employerPassword,
            name: 'Rajesh Sharma - ABC Construction',
            phone: '9000000001',
            phoneVerified: true,
            role: 'employer',
            age: 45,
        },
    });
    const employer1 = await prisma.employer.upsert({
        where: { userId: employer1User.id },
        update: {},
        create: {
            companyName: 'ABC Construction Pvt Ltd',
            gstNumber: '29ABCDE1234F1Z5',
            matchPercentage: 50,
            userId: employer1User.id,
        },
    });

    // ═══════════════════════════════════════════
    // EMPLOYER 2: XYZ Textiles
    // ═══════════════════════════════════════════
    const employer2User = await prisma.user.upsert({
        where: { email: 'employer2@pensionchain.com' },
        update: {},
        create: {
            email: 'employer2@pensionchain.com',
            password: employerPassword,
            name: 'Priya Patel - XYZ Textiles',
            phone: '9000000002',
            phoneVerified: true,
            role: 'employer',
            age: 38,
        },
    });
    const employer2 = await prisma.employer.upsert({
        where: { userId: employer2User.id },
        update: {},
        create: {
            companyName: 'XYZ Textiles Ltd',
            gstNumber: '27XYZAB5678G2H3',
            matchPercentage: 60,
            userId: employer2User.id,
        },
    });

    // ═══════════════════════════════════════════
    // WORKER 1: Ramesh Kumar (under ABC Construction)
    // ═══════════════════════════════════════════
    const worker1 = await prisma.user.upsert({
        where: { email: 'worker1@pensionchain.com' },
        update: {},
        create: {
            email: 'worker1@pensionchain.com',
            password: workerPassword,
            name: 'Ramesh Kumar',
            phone: '9876543210',
            phoneVerified: true,
            role: 'worker',
            age: 36,
            monthlyIncome: '₹10,000 - ₹20,000',
            riskProfile: 'Balanced',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
            currentEmployerId: employer1.id,
        },
    });

    // ═══════════════════════════════════════════
    // WORKER 2: Lakshmi Devi (under XYZ Textiles)
    // ═══════════════════════════════════════════
    const worker2 = await prisma.user.upsert({
        where: { email: 'worker2@pensionchain.com' },
        update: {},
        create: {
            email: 'worker2@pensionchain.com',
            password: workerPassword,
            name: 'Lakshmi Devi',
            phone: '9876543213',
            phoneVerified: true,
            role: 'worker',
            age: 35,
            monthlyIncome: '₹15,000 - ₹25,000',
            riskProfile: 'Conservative',
            walletAddress: '0xBb2C4dE538a9F12345678901234567890abcdEFa',
            currentEmployerId: employer2.id,
        },
    });

    // ── Contributions for Worker 1 (30 days) ──
    const now = Date.now();
    for (let day = 30; day >= 0; day--) {
        const date = new Date(now - day * 24 * 60 * 60 * 1000);
        await prisma.contribution.create({
            data: {
                userId: worker1.id,
                amount: 10,
                type: 'contribution',
                paymentMethod: 'upi',
                paymentStatus: 'completed',
                createdAt: date,
            },
        });

        // Employer 1 match (₹5/day = 50%)
        await prisma.contribution.create({
            data: {
                userId: worker1.id,
                amount: 5,
                employerMatch: 5,
                type: 'match',
                paymentMethod: 'employer',
                paymentStatus: 'completed',
                employerId: employer1.id,
                createdAt: date,
            },
        });

        // Weekly yield for Worker 1
        if (day % 7 === 0) {
            await prisma.contribution.create({
                data: {
                    userId: worker1.id,
                    amount: Math.round(Math.random() * 15 + 5),
                    type: 'yield',
                    paymentMethod: 'defi',
                    paymentStatus: 'completed',
                    createdAt: date,
                },
            });
        }
    }

    // ── Contributions for Worker 2 (30 days) ──
    for (let day = 30; day >= 0; day--) {
        const date = new Date(now - day * 24 * 60 * 60 * 1000);
        await prisma.contribution.create({
            data: {
                userId: worker2.id,
                amount: 15,
                type: 'contribution',
                paymentMethod: 'upi',
                paymentStatus: 'completed',
                createdAt: date,
            },
        });

        // Employer 2 match (₹9/day = 60%)
        await prisma.contribution.create({
            data: {
                userId: worker2.id,
                amount: 9,
                employerMatch: 9,
                type: 'match',
                paymentMethod: 'employer',
                paymentStatus: 'completed',
                employerId: employer2.id,
                createdAt: date,
            },
        });

        // Weekly yield for Worker 2
        if (day % 7 === 0) {
            await prisma.contribution.create({
                data: {
                    userId: worker2.id,
                    amount: Math.round(Math.random() * 20 + 8),
                    type: 'yield',
                    paymentMethod: 'defi',
                    paymentStatus: 'completed',
                    createdAt: date,
                },
            });
        }
    }

    // ── Cross-user transfers (worker1 ↔ worker2) ──
    await prisma.contribution.create({
        data: {
            userId: worker1.id,
            amount: 25,
            type: 'transfer_out',
            paymentMethod: 'internal',
            paymentStatus: 'completed',
            txHash: `TXF-W1-TO-W2-${Date.now()}`,
        },
    });
    await prisma.contribution.create({
        data: {
            userId: worker2.id,
            amount: 25,
            type: 'transfer_in',
            paymentMethod: 'internal',
            paymentStatus: 'completed',
            txHash: `TXF-W1-TO-W2-${Date.now()}`,
        },
    });
    await prisma.contribution.create({
        data: {
            userId: worker2.id,
            amount: 10,
            type: 'transfer_out',
            paymentMethod: 'internal',
            paymentStatus: 'completed',
            txHash: `TXF-W2-TO-W1-${Date.now()}`,
        },
    });
    await prisma.contribution.create({
        data: {
            userId: worker1.id,
            amount: 10,
            type: 'transfer_in',
            paymentMethod: 'internal',
            paymentStatus: 'completed',
            txHash: `TXF-W2-TO-W1-${Date.now()}`,
        },
    });

    // ── Historical monthly contributions ──
    for (let month = 1; month <= 12; month++) {
        const monthDate = new Date(now - month * 30 * 24 * 60 * 60 * 1000);
        // Worker 1
        await prisma.contribution.create({
            data: { userId: worker1.id, amount: 300, type: 'contribution', paymentMethod: 'upi', paymentStatus: 'completed', createdAt: monthDate },
        });
        await prisma.contribution.create({
            data: { userId: worker1.id, amount: 150, employerMatch: 150, type: 'match', paymentMethod: 'employer', paymentStatus: 'completed', employerId: employer1.id, createdAt: monthDate },
        });
        // Worker 2
        await prisma.contribution.create({
            data: { userId: worker2.id, amount: 450, type: 'contribution', paymentMethod: 'upi', paymentStatus: 'completed', createdAt: monthDate },
        });
        await prisma.contribution.create({
            data: { userId: worker2.id, amount: 270, employerMatch: 270, type: 'match', paymentMethod: 'employer', paymentStatus: 'completed', employerId: employer2.id, createdAt: monthDate },
        });
    }

    console.log('✅ Database seeded successfully!\n');
    console.log('📋 Demo Accounts (4 Users):');
    console.log('─────────────────────────────────────────────────────');
    console.log('  Worker 1:   worker1@pensionchain.com   / worker123');
    console.log('  Worker 2:   worker2@pensionchain.com   / worker123');
    console.log('  Employer 1: employer1@pensionchain.com / employer123');
    console.log('  Employer 2: employer2@pensionchain.com / employer123');
    console.log('─────────────────────────────────────────────────────\n');
}

seed()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
