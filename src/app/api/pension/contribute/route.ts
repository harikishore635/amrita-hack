import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, paymentMethod = 'upi' } = await req.json();
    if (!amount || amount < 1) return NextResponse.json({ error: 'Amount must be at least ₹1' }, { status: 400 });

    const user = store.findUserById(auth.userId);
    const employer = user?.currentEmployerId ? store.findEmployerById(user.currentEmployerId) : null;

    const contribution = store.addContribution({ userId: auth.userId, amount: parseFloat(amount), type: 'contribution', paymentMethod });

    let matchContribution = null;
    if (employer) {
        const matchAmt = parseFloat(amount) * (employer.matchPercentage / 100);
        matchContribution = store.addContribution({
            userId: auth.userId, amount: matchAmt, employerMatch: matchAmt,
            type: 'match', paymentMethod: 'employer', employerId: employer.id,
        });
    }

    const yieldAmt = parseFloat((parseFloat(amount) * 0.001 * (Math.random() * 3 + 1)).toFixed(2));
    store.addContribution({ userId: auth.userId, amount: yieldAmt, type: 'yield', paymentMethod: 'defi' });

    return NextResponse.json({
        message: 'Contribution successful!', contribution,
        employerMatch: matchContribution,
        totalAdded: parseFloat(amount) + (matchContribution?.amount || 0) + yieldAmt,
    }, { status: 201 });
}
