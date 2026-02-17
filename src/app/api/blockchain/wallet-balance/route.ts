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
        // Always try to get native wallet balance (this works even without a contract)
        let walletBal: { balanceMatic: string } | null = null;
        try {
            walletBal = await getWalletBalance();
        } catch (err: any) {
            console.error('[WalletBalance] Wallet balance read failed:', err.message);
        }

        // Optionally try contract data (may fail if no contract deployed)
        let contractBal: { balanceMatic: string } | null = null;
        let onChainAccount: any = null;
        try {
            [contractBal, onChainAccount] = await Promise.all([
                getContractBalance(),
                getOnChainAccount(),
            ]);
        } catch (err: any) {
            console.error('[WalletBalance] Contract read failed (ok if no contract):', err.message);
        }

        if (walletBal) {
            return NextResponse.json({
                walletAddress: user.walletAddress,
                deployerAddress: getDeployerAddress(),
                onChainBalance: `${walletBal.balanceMatic} MATIC`,
                contractBalance: contractBal ? `${contractBal.balanceMatic} MATIC` : '0 MATIC',
                onChainAccount: onChainAccount ? {
                    totalContributed: onChainAccount.totalContributed,
                    employerMatch: onChainAccount.employerMatch,
                    totalBalance: onChainAccount.totalBalance,
                    isActive: onChainAccount.isActive,
                } : null,
                appBalance: Math.round(total.sum),
                network: 'Polygon Amoy Testnet',
                chainId: 80002,
                isLive: true,
            });
        }
    }

    // Fallback to simulated data
    return NextResponse.json({
        walletAddress: user.walletAddress, onChainBalance: '0 MATIC',
        appBalance: Math.round(total.sum), network: 'Polygon Amoy Testnet',
        isLive: false,
    });
}
