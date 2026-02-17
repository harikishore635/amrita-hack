import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-auth';
import { store } from '@/lib/store';

// GET: Generate transfer QR data (worker's portable pension record)
export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = store.findUserById(auth.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { sum: totalContributed, count: totalTxns } = store.sumContributions(user.id, ['contribution']);
    const { sum: totalMatched } = store.sumContributions(user.id, ['match']);
    const { sum: totalWithdrawn } = store.sumContributions(user.id, ['withdrawal']);
    const balance = totalContributed + totalMatched - totalWithdrawn;

    const currentEmployer = user.currentEmployerId ? store.findEmployerById(user.currentEmployerId) : null;

    // Portable pension record — this is what would be encoded in the QR
    const transferRecord = {
        workerId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        walletAddress: user.walletAddress,
        pensionBalance: balance,
        totalContributed,
        totalEmployerMatch: totalMatched,
        totalWithdrawn,
        totalTransactions: totalTxns,
        riskProfile: user.riskProfile,
        currentEmployer: currentEmployer?.companyName || 'None',
        memberSince: user.createdAt,
        generatedAt: new Date().toISOString(),
        // This hash would be used for verification
        verificationCode: `PC-${user.id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    };

    return NextResponse.json(transferRecord);
}

// POST: Simulate new employer scanning the QR and accepting the worker
export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { newEmployerName, matchPercentage } = body;

    if (!newEmployerName) {
        return NextResponse.json({ error: 'New employer name is required' }, { status: 400 });
    }

    const user = store.findUserById(auth.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const oldEmployer = user.currentEmployerId ? store.findEmployerById(user.currentEmployerId) : null;
    const oldEmployerName = oldEmployer?.companyName || 'None';

    // Create new employer record
    const newEmployer = store.createEmployer({
        companyName: newEmployerName,
        matchPercentage: matchPercentage || 50,
        userId: auth.userId,
    });

    // Update user's employer
    store.updateUser(auth.userId, { currentEmployerId: newEmployer.id });

    // Calculate current balance for the transfer record
    const { sum: totalContributed } = store.sumContributions(user.id, ['contribution']);
    const { sum: totalMatched } = store.sumContributions(user.id, ['match']);
    const { sum: totalWithdrawn } = store.sumContributions(user.id, ['withdrawal']);
    const balance = totalContributed + totalMatched - totalWithdrawn;

    return NextResponse.json({
        success: true,
        message: `Successfully transferred to ${newEmployerName}!`,
        transfer: {
            from: oldEmployerName,
            to: newEmployerName,
            balanceCarried: balance,
            matchPercentage: matchPercentage || 50,
            timestamp: new Date().toISOString(),
        },
    });
}
