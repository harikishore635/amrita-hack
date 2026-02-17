import { NextResponse } from 'next/server';
import { isBlockchainConfigured, getDeployerAddress, getWalletBalance } from '@/lib/blockchain';
import { JsonRpcProvider } from 'ethers';

export async function GET() {
    if (!isBlockchainConfigured()) {
        return NextResponse.json({
            status: 'not_configured',
            message: 'Blockchain env vars not set (DEPLOYER_PRIVATE_KEY, CONTRACT_ADDRESS)',
            isLive: false,
        });
    }

    try {
        const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology';
        const provider = new JsonRpcProvider(RPC_URL, { name: 'polygon-amoy', chainId: 80002 });
        const blockNumber = await provider.getBlockNumber();
        const walletBal = await getWalletBalance();

        return NextResponse.json({
            status: 'ok',
            isLive: true,
            connected: true,
            network: 'polygon-amoy',
            chainId: 80002,
            blockNumber,
            deployerAddress: getDeployerAddress(),
            deployerBalance: walletBal.balanceMatic + ' MATIC',
        });
    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            isLive: false,
            error: err.message,
        }, { status: 500 });
    }
}
