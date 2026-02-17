import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contribs = store.sumContributions(auth.userId, ['contribution']);
    const matches = store.sumContributions(auth.userId, ['match']);
    const yields = store.sumContributions(auth.userId, ['yield']);
    const withdrawals = store.sumContributions(auth.userId, ['withdrawal']);
    const transfersIn = store.sumContributions(auth.userId, ['transfer_in']);
    const transfersOut = store.sumContributions(auth.userId, ['transfer_out']);
    const balance = contribs.sum + matches.sum + yields.sum + transfersIn.sum - withdrawals.sum - transfersOut.sum;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const todayContribution = store.sumContributionsSince(auth.userId, ['contribution', 'match'], today);
    const monthContribution = store.sumContributionsSince(auth.userId, ['contribution'], monthStart);
    const monthMatch = store.sumContributionsSince(auth.userId, ['match'], monthStart);

    return NextResponse.json({
        balance: Math.round(balance), totalContributed: Math.round(contribs.sum),
        totalMatches: Math.round(matches.sum), totalYields: Math.round(yields.sum),
        totalWithdrawals: Math.round(withdrawals.sum),
        totalTransfersIn: Math.round(transfersIn.sum),
        totalTransfersOut: Math.round(transfersOut.sum),
        todayContribution, monthContribution, monthMatch,
    });
}
