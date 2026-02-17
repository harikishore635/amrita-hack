import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = store.findUserById(auth.userId);
    const total = store.sumContributions(auth.userId, ['contribution', 'match', 'yield']);
    const balance = total.sum;
    const ytr = Math.max(60 - (user?.age || 30), 0);

    return NextResponse.json({
        suggestions: [
            { icon: '📈', title: 'Increase Contribution', text: `Adding ₹5 more/day could add ₹${Math.round(5 * 365 * ytr * 1.08 / 100000)}L to retirement!` },
            { icon: '🏢', title: 'Employer Matching', text: user?.currentEmployerId ? 'Great! Your employer is matching contributions.' : 'Link an employer to get up to 50% matching.' },
            { icon: '🎯', title: 'On Track', text: balance > 0 ? `Balance of ₹${Math.round(balance).toLocaleString()} is growing!` : 'Start your first contribution today!' },
        ],
    });
}
