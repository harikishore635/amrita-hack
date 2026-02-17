import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';
import { isBlockchainConfigured, getRecentContributions } from '@/lib/blockchain';

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items } = store.getContributions(auth.userId, { limit: 20 });
    const appTransactions = items.filter(c => c.txHash);

    // Try to fetch real on-chain events
    let onChainEvents: any[] = [];
    if (isBlockchainConfigured()) {
        try {
            onChainEvents = await getRecentContributions(20);
        } catch (err: any) {
            console.error('[Transactions] Failed to fetch on-chain events:', err.message);
        }
    }

    return NextResponse.json({
        transactions: appTransactions,
        onChainEvents,
        isLive: isBlockchainConfigured(),
    });
}
