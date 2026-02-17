import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items } = store.getContributions(auth.userId, { limit: 20 });
    return NextResponse.json({ payments: items.filter(c => c.paymentMethod === 'upi') });
}
