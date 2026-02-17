import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = store.findUserById(auth.userId);
    if (!user?.walletAddress) return NextResponse.json({ error: 'No wallet found' }, { status: 400 });

    const total = store.sumContributions(auth.userId, ['contribution', 'match', 'yield']);

    return NextResponse.json({
        walletAddress: user.walletAddress, onChainBalance: '0 MATIC',
        appBalance: Math.round(total.sum), network: 'Polygon Amoy Testnet',
    });
}
