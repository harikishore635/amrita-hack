import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';
import { isBlockchainConfigured, getDeployerAddress } from '@/lib/blockchain';

export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = store.findUserById(auth.userId);
    if (user?.walletAddress) return NextResponse.json({ walletAddress: user.walletAddress, message: 'Wallet already exists' });

    // If blockchain is configured, assign the deployer address as the custodial wallet
    // In a production system, each user would get a derived wallet address
    let walletAddress: string;
    
    if (isBlockchainConfigured()) {
        walletAddress = getDeployerAddress();
    } else {
        // Fallback: generate a random address for demo
        const crypto = await import('crypto');
        walletAddress = '0x' + crypto.randomBytes(20).toString('hex');
    }

    store.updateUser(auth.userId, { walletAddress });

    return NextResponse.json({
        walletAddress,
        message: 'Blockchain wallet created',
        network: 'Polygon Amoy Testnet',
        chainId: 80002,
        isLive: isBlockchainConfigured(),
    });
}
