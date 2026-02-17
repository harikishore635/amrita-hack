import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-auth';
import { store } from '@/lib/store';

// GET: Returns all contributions grouped by employer
export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = store.findUserById(auth.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Get ALL contributions (no limit)
    const { items: allContributions } = store.getContributions(auth.userId);

    // Build employer map from all known employers for this user
    const employerMap: Record<string, { name: string; matchPercentage: number }> = {};
    // Collect employer IDs from contributions
    const seenEmployerIds = new Set<string>();
    allContributions.forEach(c => { if (c.employerId) seenEmployerIds.add(c.employerId); });
    // Also add current employer
    if (user.currentEmployerId) seenEmployerIds.add(user.currentEmployerId);

    seenEmployerIds.forEach(id => {
        const employer = store.findEmployerById(id);
        if (employer) {
            employerMap[id] = { name: employer.companyName, matchPercentage: employer.matchPercentage };
        }
    });

    // For contributions without employerId, attribute to current employer
    const currentEmpId = user.currentEmployerId;
    const currentEmpName = currentEmpId && employerMap[currentEmpId]
        ? employerMap[currentEmpId].name
        : 'Your Company';

    // Group contributions by employer
    const grouped: Record<string, {
        employerId: string | null;
        employerName: string;
        matchPercentage: number;
        isCurrent: boolean;
        transactions: any[];
        totalContributed: number;
        totalMatched: number;
        totalWithdrawn: number;
        netBalance: number;
        txCount: number;
        firstDate: string;
        lastDate: string;
    }> = {};

    allContributions.forEach(c => {
        // Attribute null-employerId contributions to current employer
        const effectiveEmployerId = c.employerId || currentEmpId;
        const key = effectiveEmployerId || '_self';

        if (!grouped[key]) {
            const emp = effectiveEmployerId ? employerMap[effectiveEmployerId] : null;
            grouped[key] = {
                employerId: effectiveEmployerId,
                employerName: emp?.name || currentEmpName,
                matchPercentage: emp?.matchPercentage || 0,
                isCurrent: effectiveEmployerId === currentEmpId,
                transactions: [],
                totalContributed: 0,
                totalMatched: 0,
                totalWithdrawn: 0,
                netBalance: 0,
                txCount: 0,
                firstDate: c.createdAt.toISOString(),
                lastDate: c.createdAt.toISOString(),
            };
        }

        const g = grouped[key];
        g.transactions.push({
            id: c.id,
            type: c.type,
            amount: c.amount,
            employerMatch: c.employerMatch,
            paymentMethod: c.paymentMethod,
            txHash: c.txHash,
            createdAt: c.createdAt,
        });

        if (c.type === 'contribution') g.totalContributed += c.amount;
        if (c.type === 'match') g.totalMatched += c.amount;
        if (c.type === 'withdrawal') g.totalWithdrawn += c.amount;
        g.txCount++;

        const cDate = c.createdAt.toISOString();
        if (cDate < g.firstDate) g.firstDate = cDate;
        if (cDate > g.lastDate) g.lastDate = cDate;
    });

    // Calculate net for each group
    Object.values(grouped).forEach(g => {
        g.netBalance = g.totalContributed + g.totalMatched - g.totalWithdrawn;
    });

    // Sort: current employer first, then by last date desc
    const employers = Object.values(grouped).sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime();
    });

    return NextResponse.json({
        employers,
        totalEmployers: employers.length,
        currentEmployer: currentEmpId ? employerMap[currentEmpId]?.name : null,
    });
}

