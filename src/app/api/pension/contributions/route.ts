import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const { items, total } = store.getContributions(auth.userId, { limit, skip: (page - 1) * limit });

    return NextResponse.json({
        contributions: items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}
