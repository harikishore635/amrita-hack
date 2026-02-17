import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

// GET: List all users (excluding current user) for transfer recipient selection
export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const users = store.users
        .filter(u => u.id !== auth.userId)
        .map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
        }));

    return NextResponse.json({ users });
}
