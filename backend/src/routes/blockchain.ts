import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

// ─────────────────────────────────────────────
// POST /api/blockchain/create-wallet
// ─────────────────────────────────────────────
router.post('/create-wallet', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.walletAddress) {
            res.json({ walletAddress: user.walletAddress, message: 'Wallet already exists' });
            return;
        }

        // Generate a deterministic wallet address (simulated for demo)
        // In production, use ethers.js Wallet.createRandom()
        let walletAddress: string;
        try {
            const { ethers } = await import('ethers');
            const wallet = ethers.Wallet.createRandom();
            walletAddress = wallet.address;
            console.log(`\n🔑 New wallet created for ${user?.name}:`);
            console.log(`   Address: ${walletAddress}`);
            console.log(`   ⚠️  Private key (save this!): ${wallet.privateKey}\n`);
        } catch {
            // Fallback: generate a fake address
            walletAddress = '0x' + crypto.randomBytes(20).toString('hex');
        }

        await prisma.user.update({
            where: { id: userId },
            data: { walletAddress },
        });

        res.json({
            walletAddress,
            message: 'Blockchain wallet created successfully',
            network: 'Polygon Amoy Testnet',
        });
    } catch (error: any) {
        console.error('Create wallet error:', error);
        res.status(500).json({ error: 'Failed to create wallet' });
    }
});

// ─────────────────────────────────────────────
// GET /api/blockchain/wallet-balance
// ─────────────────────────────────────────────
router.get('/wallet-balance', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user?.walletAddress) {
            res.status(400).json({ error: 'No wallet found. Create one first.' });
            return;
        }

        // Try to get on-chain balance if RPC URL is configured
        let onChainBalance = '0';
        try {
            const rpcUrl = process.env.POLYGON_RPC_URL;
            if (rpcUrl) {
                const { ethers } = await import('ethers');
                const provider = new ethers.JsonRpcProvider(rpcUrl);
                const balance = await provider.getBalance(user.walletAddress);
                onChainBalance = ethers.formatEther(balance);
            }
        } catch (err) {
            // RPC not available, return 0
        }

        // Also return app-tracked balance
        const contributions = await prisma.contribution.aggregate({
            where: { userId, type: { in: ['contribution', 'match', 'yield'] } },
            _sum: { amount: true },
        });

        res.json({
            walletAddress: user.walletAddress,
            onChainBalance: onChainBalance + ' MATIC',
            appBalance: Math.round(contributions._sum.amount || 0),
            network: 'Polygon Amoy Testnet',
        });
    } catch (error: any) {
        console.error('Wallet balance error:', error);
        res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
});

// ─────────────────────────────────────────────
// GET /api/blockchain/transactions
// ─────────────────────────────────────────────
router.get('/transactions', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const transactions = await prisma.contribution.findMany({
            where: { userId, txHash: { not: null } },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                amount: true,
                type: true,
                txHash: true,
                createdAt: true,
                paymentStatus: true,
            },
        });

        res.json({ transactions });
    } catch (error: any) {
        console.error('Transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

export default router;
