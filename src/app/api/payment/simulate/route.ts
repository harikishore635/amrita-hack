import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';
import { contribute as blockchainContribute, isBlockchainConfigured } from '@/lib/blockchain';

export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, upiId } = await req.json();
    if (!amount || amount < 1) return NextResponse.json({ error: 'Amount must be at least ₹1' }, { status: 400 });

    // ── On-chain transaction ──
    let blockchainResult = null;
    let txHash: string | null = null;

    if (isBlockchainConfigured()) {
        try {
            blockchainResult = await blockchainContribute(auth.userId, parseFloat(amount));
            txHash = blockchainResult.txHash;
        } catch (err: any) {
            console.error('[Payment] Blockchain transaction failed:', err.message);
            // Fallback to simulated tx ID
            txHash = `UPI${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
    } else {
        // Simulate processing delay when blockchain is not configured
        await new Promise(r => setTimeout(r, 500));
        txHash = `UPI${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    const user = store.findUserById(auth.userId);
    const employer = user?.currentEmployerId ? store.findEmployerById(user.currentEmployerId) : null;

    store.addContribution({ userId: auth.userId, amount: parseFloat(amount), type: 'contribution', paymentMethod: 'upi', txHash });

    let matchAmt = 0;
    if (employer) {
        matchAmt = parseFloat(amount) * (employer.matchPercentage / 100);
        store.addContribution({ userId: auth.userId, amount: matchAmt, employerMatch: matchAmt, type: 'match', paymentMethod: 'employer', employerId: employer.id, txHash: txHash ? `MATCH-${txHash.slice(0, 20)}` : null });
    }

    return NextResponse.json({
        success: true, message: 'Payment successful!',
        transaction: {
            id: txHash,
            amount: parseFloat(amount),
            employerMatch: matchAmt,
            total: parseFloat(amount) + matchAmt,
            method: 'UPI',
            status: 'completed',
            timestamp: new Date().toISOString(),
        },
        blockchain: blockchainResult ? {
            txHash: blockchainResult.txHash,
            blockNumber: blockchainResult.blockNumber,
            gasUsed: blockchainResult.gasUsed,
            amountMatic: blockchainResult.amountMatic,
            explorerUrl: blockchainResult.explorerUrl,
            network: 'Polygon Amoy Testnet',
        } : null,
    });
}

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items } = store.getContributions(auth.userId, { limit: 20 });
    return NextResponse.json({ payments: items.filter(c => c.paymentMethod === 'upi') });
}
