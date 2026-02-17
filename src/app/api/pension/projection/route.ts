import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = store.findUserById(auth.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const total = store.sumContributions(auth.userId, ['contribution', 'match', 'yield']);
    const balance = total.sum;
    const age = user.age || 30;
    const ytr = Math.max(60 - age, 0);
    const days = Math.max(1, Math.ceil((Date.now() - user.createdAt.getTime()) / 86400000));
    const avgDaily = total.count > 0 ? balance / days : 15;

    const scenarios = [
        { label: 'Conservative (6%)', rate: 0.06 },
        { label: 'Moderate (8%)', rate: 0.08 },
        { label: 'Aggressive (12%)', rate: 0.12 },
    ];

    const projections = scenarios.map(({ label, rate }) => {
        const annual = avgDaily * 365;
        let corpus = balance;
        for (let i = 0; i < ytr; i++) corpus = (corpus + annual) * (1 + rate);
        return { label, rate: rate * 100, corpus: Math.round(corpus), monthlyPension: Math.round(corpus / 180) };
    });

    return NextResponse.json({
        currentBalance: Math.round(balance), age, yearsToRetirement: ytr,
        avgDailyContribution: Math.round(avgDaily * 100) / 100, projections,
    });
}
