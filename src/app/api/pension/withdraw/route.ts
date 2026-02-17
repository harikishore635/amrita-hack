import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';
import { isBlockchainConfigured } from '@/lib/blockchain';

export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, reason } = await req.json();
    if (!amount || amount < 1) return NextResponse.json({ error: 'Amount must be at least ₹1' }, { status: 400 });

    const user = store.findUserById(auth.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Calculate available balance
    const total = store.sumContributions(auth.userId, ['contribution', 'match', 'yield']);
    const withdrawn = store.sumContributions(auth.userId, ['withdrawal']);
    const available = total.sum - withdrawn.sum;

    // Emergency withdrawal: max 50% of balance, 10% penalty
    const maxWithdraw = available * 0.5;
    if (amount > maxWithdraw) {
        return NextResponse.json({
            error: `Maximum emergency withdrawal is ₹${Math.floor(maxWithdraw)} (50% of balance)`,
            maxAmount: Math.floor(maxWithdraw),
            balance: Math.round(available),
        }, { status: 400 });
    }

    // Apply 10% penalty
    const penalty = Math.round(amount * 0.10);
    const netAmount = amount - penalty;

    // Record the withdrawal
    const txHash = `WD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    store.addContribution({
        userId: auth.userId,
        amount: amount,
        type: 'withdrawal',
        paymentMethod: 'bank_transfer',
        txHash,
    });

    return NextResponse.json({
        success: true,
        message: `₹${netAmount} withdrawn successfully (₹${penalty} penalty applied)`,
        withdrawal: {
            id: txHash,
            grossAmount: amount,
            penalty,
            netAmount,
            reason: reason || 'Emergency',
            status: 'completed',
            timestamp: new Date().toISOString(),
        },
        remainingBalance: Math.round(available - amount),
    });
}

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const total = store.sumContributions(auth.userId, ['contribution', 'match', 'yield']);
    const withdrawn = store.sumContributions(auth.userId, ['withdrawal']);
    const available = total.sum - withdrawn.sum;
    const maxEmergency = available * 0.5;

    return NextResponse.json({
        totalBalance: Math.round(total.sum),
        totalWithdrawn: Math.round(withdrawn.sum),
        availableBalance: Math.round(available),
        maxEmergencyWithdrawal: Math.floor(maxEmergency),
        penaltyRate: 10,
        withdrawals: store.getContributions(auth.userId, { types: ['withdrawal'], limit: 20 }).items,
    });
}
