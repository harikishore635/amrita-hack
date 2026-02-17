import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';
import { contribute as blockchainContribute, isBlockchainConfigured } from '@/lib/blockchain';

export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, paymentMethod = 'upi' } = await req.json();
    if (!amount || amount < 1) return NextResponse.json({ error: 'Amount must be at least ₹1' }, { status: 400 });

    const user = store.findUserById(auth.userId);
    const employer = user?.currentEmployerId ? store.findEmployerById(user.currentEmployerId) : null;

    // ── On-chain transaction ──
    let blockchainResult = null;
    let txHash: string | null = null;
    let blockNumber: number | null = null;

    if (isBlockchainConfigured()) {
        try {
            blockchainResult = await blockchainContribute(auth.userId, parseFloat(amount));
            txHash = blockchainResult.txHash;
            blockNumber = blockchainResult.blockNumber;
        } catch (err: any) {
            console.error('[Contribute] Blockchain transaction failed:', err.message);
            // Continue with in-memory store even if blockchain fails
        }
    }

    // ── In-memory store (app state) ──
    const contribution = store.addContribution({
        userId: auth.userId,
        amount: parseFloat(amount),
        type: 'contribution',
        paymentMethod,
        txHash,
        employerId: employer?.id || null,
    });

    let matchContribution = null;
    if (employer) {
        const matchAmt = parseFloat(amount) * (employer.matchPercentage / 100);
        matchContribution = store.addContribution({
            userId: auth.userId, amount: matchAmt, employerMatch: matchAmt,
            type: 'match', paymentMethod: 'employer', employerId: employer.id,
            txHash: txHash ? `MATCH-${txHash.slice(0, 20)}` : null,
        });
    }

    const yieldAmt = parseFloat((parseFloat(amount) * 0.001 * (Math.random() * 3 + 1)).toFixed(2));
    store.addContribution({ userId: auth.userId, amount: yieldAmt, type: 'yield', paymentMethod: 'defi', employerId: employer?.id || null });

    return NextResponse.json({
        message: 'Contribution successful!',
        contribution,
        employerMatch: matchContribution,
        totalAdded: parseFloat(amount) + (matchContribution?.amount || 0) + yieldAmt,
        blockchain: blockchainResult ? {
            txHash: blockchainResult.txHash,
            blockNumber: blockchainResult.blockNumber,
            gasUsed: blockchainResult.gasUsed,
            amountMatic: blockchainResult.amountMatic,
            explorerUrl: blockchainResult.explorerUrl,
            network: 'Polygon Amoy Testnet',
        } : null,
    }, { status: 201 });
}
