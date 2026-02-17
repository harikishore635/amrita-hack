import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = store.findUserById(auth.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const contribs = store.sumContributions(auth.userId, ['contribution']);
    const matches = store.sumContributions(auth.userId, ['match']);
    const yields = store.sumContributions(auth.userId, ['yield']);
    const balance = contribs.sum + matches.sum + yields.sum;

    const age = user.age || 30;
    const yearsToRetirement = Math.max(60 - age, 0);
    const daysSinceJoin = Math.max(1, Math.ceil((Date.now() - user.createdAt.getTime()) / 86400000));
    const avgDaily = contribs.count > 0 ? balance / daysSinceJoin : 15;
    const projectedCorpus = balance + (avgDaily * 1.5 * 365 * yearsToRetirement * 1.08);
    const monthlyPension = projectedCorpus > 0 ? Math.round(projectedCorpus / (15 * 12)) : 0;

    const employer = user.currentEmployerId ? store.findEmployerById(user.currentEmployerId) : null;

    return NextResponse.json({
        id: user.id, email: user.email, name: user.name, phone: user.phone,
        phoneVerified: user.phoneVerified, age: user.age, monthlyIncome: user.monthlyIncome,
        riskProfile: user.riskProfile, role: user.role, walletAddress: user.walletAddress,
        currentEmployerId: user.currentEmployerId, createdAt: user.createdAt,
        employedAt: employer ? { id: employer.id, companyName: employer.companyName, matchPercentage: employer.matchPercentage } : null,
        stats: {
            balance: Math.round(balance), totalContributed: Math.round(contribs.sum),
            totalMatches: Math.round(matches.sum), totalYields: Math.round(yields.sum),
            contributionCount: contribs.count, projectedCorpus: Math.round(projectedCorpus),
            monthlyPension, daysUntilRetirement: yearsToRetirement * 365,
        },
    });
}

export async function PUT(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, age, monthlyIncome, riskProfile } = await req.json();
    const user = store.updateUser(auth.userId, {
        ...(name && { name }),
        ...(age && { age: parseInt(age) }),
        ...(monthlyIncome && { monthlyIncome }),
        ...(riskProfile && { riskProfile }),
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
        message: 'Profile updated',
        user: { id: user.id, email: user.email, name: user.name, phone: user.phone, age: user.age, monthlyIncome: user.monthlyIncome, riskProfile: user.riskProfile, role: user.role, walletAddress: user.walletAddress },
    });
}
