import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';
import { isBlockchainConfigured, getWalletBalance, getContractBalance, getDeployerAddress, getOnChainAccount } from '@/lib/blockchain';

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = store.findUserById(auth.userId);
    if (!user?.walletAddress) return NextResponse.json({ error: 'No wallet found' }, { status: 400 });

    const total = store.sumContributions(auth.userId, ['contribution', 'match', 'yield']);

    // Try to get real on-chain data
    if (isBlockchainConfigured()) {
        try {
            const [walletBal, contractBal, onChainAccount] = await Promise.all([
                getWalletBalance(),
                getContractBalance(),
                getOnChainAccount(),
            ]);

            return NextResponse.json({
                walletAddress: user.walletAddress,
                deployerAddress: getDeployerAddress(),
                onChainBalance: `${walletBal.balanceMatic} MATIC`,
                contractBalance: `${contractBal.balanceMatic} MATIC`,
                onChainAccount: {
                    totalContributed: onChainAccount.totalContributed,
                    employerMatch: onChainAccount.employerMatch,
                    totalBalance: onChainAccount.totalBalance,
                    isActive: onChainAccount.isActive,
                },
                appBalance: Math.round(total.sum),
                network: 'Polygon Amoy Testnet',
                chainId: 80002,
                isLive: true,
            });
        } catch (err: any) {
            console.error('[WalletBalance] Blockchain read failed:', err.message);
        }
    }

    // Fallback to simulated data
    return NextResponse.json({
        walletAddress: user.walletAddress, onChainBalance: '0 MATIC',
        appBalance: Math.round(total.sum), network: 'Polygon Amoy Testnet',
        isLive: false,
    });
}
