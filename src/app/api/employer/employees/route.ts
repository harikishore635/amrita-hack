import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const employer = store.findEmployerByUserId(auth.userId);
    if (!employer) return NextResponse.json({ error: 'Not an employer account' }, { status: 403 });

    const employees = store.getEmployees(employer.id);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const employeesWithStats = employees.map(emp => {
        const mc = store.sumContributionsSince(emp.id, ['contribution'], monthStart);
        const mm = store.sumContributionsSince(emp.id, ['match'], monthStart);
        const tc = store.sumContributions(emp.id, ['contribution']).sum;
        return {
            id: emp.id, name: emp.name, email: emp.email, phone: emp.phone,
            age: emp.age, riskProfile: emp.riskProfile, createdAt: emp.createdAt,
            monthlyContribution: mc, monthlyMatch: mm, totalContributed: tc,
            status: mc > 0 ? 'active' : 'pending',
        };
    });

    return NextResponse.json({
        employer: { id: employer.id, companyName: employer.companyName, matchPercentage: employer.matchPercentage, totalEmployees: employees.length, activeContributors: employeesWithStats.filter(e => e.status === 'active').length },
        employees: employeesWithStats,
    });
}
