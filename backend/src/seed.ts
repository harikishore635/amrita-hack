import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Seed script to populate the database with demo data
 * Run with: npm run db:seed
 */
async function seed() {
    console.log('🌱 Seeding database...\n');

    // Create demo employer user
    const employerPassword = await bcrypt.hash('employer123', 12);
    const employerUser = await prisma.user.upsert({
        where: { email: 'employer@abc.com' },
        update: {},
        create: {
            email: 'employer@abc.com',
            password: employerPassword,
            name: 'Admin - ABC Construction',
            phone: '9000000001',
            phoneVerified: true,
            role: 'employer',
            age: 45,
        },
    });

    // Create employer record
    const employer = await prisma.employer.upsert({
        where: { userId: employerUser.id },
        update: {},
        create: {
            companyName: 'ABC Construction Pvt Ltd',
            gstNumber: '29ABCDE1234F1Z5',
            matchPercentage: 50,
            userId: employerUser.id,
        },
    });

    // Create demo worker user
    const workerPassword = await bcrypt.hash('worker123', 12);
    const worker = await prisma.user.upsert({
        where: { email: 'ramesh@pension.com' },
        update: {},
        create: {
            email: 'ramesh@pension.com',
            password: workerPassword,
            name: 'Ramesh Kumar',
            phone: '9876543210',
            phoneVerified: true,
            role: 'worker',
            age: 36,
            monthlyIncome: '₹10,000 - ₹20,000',
            riskProfile: 'Balanced',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
            currentEmployerId: employer.id,
        },
    });

    // Create more demo workers
    const workerNames = [
        { name: 'Suresh Patel', email: 'suresh@pension.com', phone: '9876543211', age: 28 },
        { name: 'Mohammed Ali', email: 'mohammed@pension.com', phone: '9876543212', age: 42 },
        { name: 'Lakshmi Devi', email: 'lakshmi@pension.com', phone: '9876543213', age: 35 },
        { name: 'Ravi Singh', email: 'ravi@pension.com', phone: '9876543214', age: 31 },
    ];

    for (const w of workerNames) {
        await prisma.user.upsert({
            where: { email: w.email },
            update: {},
            create: {
                email: w.email,
                password: workerPassword,
                name: w.name,
                phone: w.phone,
                phoneVerified: true,
                role: 'worker',
                age: w.age,
                monthlyIncome: '₹10,000 - ₹20,000',
                riskProfile: 'Balanced',
                currentEmployerId: employer.id,
            },
        });
    }

    // Create demo contributions for Ramesh (30 days of history)
    const now = Date.now();
    for (let day = 30; day >= 0; day--) {
        const date = new Date(now - day * 24 * 60 * 60 * 1000);

        // Worker contribution (₹10/day)
        await prisma.contribution.create({
            data: {
                userId: worker.id,
                amount: 10,
                type: 'contribution',
                paymentMethod: 'upi',
                paymentStatus: 'completed',
                createdAt: date,
            },
        });

        // Employer match (₹5/day = 50%)
        await prisma.contribution.create({
            data: {
                userId: worker.id,
                amount: 5,
                employerMatch: 5,
                type: 'match',
                paymentMethod: 'employer',
                paymentStatus: 'completed',
                employerId: employer.id,
                createdAt: date,
            },
        });

        // Weekly yield
        if (day % 7 === 0) {
            await prisma.contribution.create({
                data: {
                    userId: worker.id,
                    amount: Math.round(Math.random() * 15 + 5),
                    type: 'yield',
                    paymentMethod: 'defi',
                    paymentStatus: 'completed',
                    createdAt: date,
                },
            });
        }
    }

    // Add some historical contributions (simulating months)
    for (let month = 1; month <= 12; month++) {
        const monthDate = new Date(now - month * 30 * 24 * 60 * 60 * 1000);
        await prisma.contribution.create({
            data: {
                userId: worker.id,
                amount: 300, // ₹10 * 30 days
                type: 'contribution',
                paymentMethod: 'upi',
                paymentStatus: 'completed',
                createdAt: monthDate,
            },
        });
        await prisma.contribution.create({
            data: {
                userId: worker.id,
                amount: 150,
                employerMatch: 150,
                type: 'match',
                paymentMethod: 'employer',
                paymentStatus: 'completed',
                employerId: employer.id,
                createdAt: monthDate,
            },
        });
    }

    console.log('✅ Database seeded successfully!\n');
    console.log('📋 Demo Accounts:');
    console.log('─────────────────────────────');
    console.log('  Worker:   ramesh@pension.com / worker123');
    console.log('  Employer: employer@abc.com / employer123');
    console.log('─────────────────────────────\n');
}

seed()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
