import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, upiId } = await req.json();
    if (!amount || amount < 1) return NextResponse.json({ error: 'Amount must be at least ₹1' }, { status: 400 });

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 500));
    const txId = `UPI${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const user = store.findUserById(auth.userId);
    const employer = user?.currentEmployerId ? store.findEmployerById(user.currentEmployerId) : null;

    store.addContribution({ userId: auth.userId, amount: parseFloat(amount), type: 'contribution', paymentMethod: 'upi', txHash: txId });

    let matchAmt = 0;
    if (employer) {
        matchAmt = parseFloat(amount) * (employer.matchPercentage / 100);
        store.addContribution({ userId: auth.userId, amount: matchAmt, employerMatch: matchAmt, type: 'match', paymentMethod: 'employer', employerId: employer.id, txHash: `MATCH-${txId}` });
    }

    return NextResponse.json({
        success: true, message: 'Payment successful!',
        transaction: { id: txId, amount: parseFloat(amount), employerMatch: matchAmt, total: parseFloat(amount) + matchAmt, method: 'UPI', status: 'completed', timestamp: new Date().toISOString() },
    });
}

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items } = store.getContributions(auth.userId, { limit: 20 });
    return NextResponse.json({ payments: items.filter(c => c.paymentMethod === 'upi') });
}
