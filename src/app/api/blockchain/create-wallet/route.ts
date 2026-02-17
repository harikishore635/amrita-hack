import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = store.findUserById(auth.userId);
    if (user?.walletAddress) return NextResponse.json({ walletAddress: user.walletAddress, message: 'Wallet already exists' });

    const walletAddress = '0x' + crypto.randomBytes(20).toString('hex');
    store.updateUser(auth.userId, { walletAddress });

    return NextResponse.json({ walletAddress, message: 'Blockchain wallet created', network: 'Polygon Amoy Testnet' });
}
