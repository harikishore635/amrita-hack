import { NextResponse } from 'next/server';
import { isBlockchainConfigured, healthCheck } from '@/lib/blockchain';

export async function GET() {
    if (!isBlockchainConfigured()) {
        return NextResponse.json({
            status: 'not_configured',
            message: 'Blockchain env vars not set (DEPLOYER_PRIVATE_KEY, CONTRACT_ADDRESS)',
            isLive: false,
        });
    }

    try {
        const health = await healthCheck();
        return NextResponse.json({
            status: 'ok',
            isLive: true,
            ...health,
        });
    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            isLive: false,
            error: err.message,
        }, { status: 500 });
    }
}
