import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
    try {
        const auth = getAuthUser(req);
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Dynamically import ethers (server-side only)
        const { JsonRpcProvider, Wallet, parseEther, formatEther } = await import('ethers');

        const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology';
        const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

        if (!DEPLOYER_PRIVATE_KEY) {
            return NextResponse.json({ error: 'Blockchain not configured. DEPLOYER_PRIVATE_KEY is missing.' }, { status: 500 });
        }

        const provider = new JsonRpcProvider(RPC_URL, { name: 'polygon-amoy', chainId: 80002 });
        const wallet = new Wallet(DEPLOYER_PRIVATE_KEY, provider);

        // Check balance first
        const balance = await provider.getBalance(wallet.address);
        const balanceMatic = parseFloat(formatEther(balance));

        if (balanceMatic < 0.001) {
            return NextResponse.json({
                error: 'Insufficient testnet MATIC',
                walletAddress: wallet.address,
                balance: `${balanceMatic.toFixed(6)} MATIC`,
                message: `Wallet has only ${balanceMatic.toFixed(6)} MATIC. Need at least 0.001 MATIC. Get free testnet MATIC from https://faucet.polygon.technology/`,
                faucetUrl: 'https://faucet.polygon.technology/',
            }, { status: 400 });
        }

        // Self-transfer: send a tiny amount to ourselves
        const selfTransferAmount = parseEther('0.0001'); // 0.0001 MATIC (~₹0.01)

        console.log(`[Self-Transfer] Sending 0.0001 MATIC from ${wallet.address} to self...`);

        const tx = await wallet.sendTransaction({
            to: wallet.address,
            value: selfTransferAmount,
        });

        console.log(`[Self-Transfer] Tx submitted: ${tx.hash}`);

        // Wait for 1 confirmation
        const receipt = await tx.wait(1);

        console.log(`[Self-Transfer] Tx confirmed in block ${receipt!.blockNumber}`);

        // Also store this as a contribution record
        const { store } = await import('@/lib/store');
        store.addContribution({
            userId: auth.userId,
            amount: 1, // ₹1 symbolic
            type: 'contribution',
            paymentMethod: 'blockchain',
            txHash: receipt!.hash,
        });

        return NextResponse.json({
            success: true,
            message: 'Self-transfer successful! Transaction confirmed on Polygon Amoy.',
            txHash: receipt!.hash,
            blockNumber: receipt!.blockNumber,
            gasUsed: receipt!.gasUsed.toString(),
            from: wallet.address,
            to: wallet.address,
            amount: '0.0001 MATIC',
            explorerUrl: `https://amoy.polygonscan.com/tx/${receipt!.hash}`,
            balanceAfter: formatEther(await provider.getBalance(wallet.address)) + ' MATIC',
        });
    } catch (error: any) {
        console.error('[Self-Transfer] Error:', error);
        return NextResponse.json({
            error: 'Self-transfer failed',
            message: error.message || 'Unknown error',
            hint: error.message?.includes('insufficient funds')
                ? 'Wallet needs testnet MATIC. Get free tokens from https://faucet.polygon.technology/'
                : 'Check console for details',
        }, { status: 500 });
    }
}

// GET: check wallet status
export async function GET(req: NextRequest) {
    try {
        const auth = getAuthUser(req);
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { JsonRpcProvider, Wallet, formatEther } = await import('ethers');

        const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology';
        const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

        if (!DEPLOYER_PRIVATE_KEY) {
            return NextResponse.json({ configured: false, error: 'DEPLOYER_PRIVATE_KEY missing' });
        }

        const provider = new JsonRpcProvider(RPC_URL, { name: 'polygon-amoy', chainId: 80002 });
        const wallet = new Wallet(DEPLOYER_PRIVATE_KEY, provider);
        const balance = await provider.getBalance(wallet.address);
        const balanceMatic = parseFloat(formatEther(balance));
        const blockNumber = await provider.getBlockNumber();

        return NextResponse.json({
            configured: true,
            walletAddress: wallet.address,
            balance: `${balanceMatic.toFixed(6)} MATIC`,
            hasFunds: balanceMatic >= 0.001,
            network: 'Polygon Amoy Testnet',
            chainId: 80002,
            latestBlock: blockNumber,
            faucetUrl: 'https://faucet.polygon.technology/',
        });
    } catch (error: any) {
        return NextResponse.json({
            configured: false,
            error: error.message,
        });
    }
}
