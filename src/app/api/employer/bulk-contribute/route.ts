import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const employer = store.findEmployerByUserId(auth.userId);
    if (!employer) return NextResponse.json({ error: 'Not an employer account' }, { status: 403 });

    const { employeeIds, amount } = await req.json();
    if (!employeeIds?.length) return NextResponse.json({ error: 'Employee IDs required' }, { status: 400 });

    const perEmp = parseFloat(amount) || 10;
    const matchAmt = perEmp * (employer.matchPercentage / 100);

    const results = employeeIds.map((empId: string) => {
        const c = store.addContribution({ userId: empId, amount: perEmp, type: 'contribution', paymentMethod: 'employer', employerId: employer.id });
        const m = store.addContribution({ userId: empId, amount: matchAmt, employerMatch: matchAmt, type: 'match', paymentMethod: 'employer', employerId: employer.id });
        return { employeeId: empId, contribution: c, match: m };
    });

    return NextResponse.json({
        message: `Bulk contribution processed for ${results.length} employees`,
        totalAmount: (perEmp + matchAmt) * results.length, results,
    });
}
