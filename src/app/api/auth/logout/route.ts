import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

export async function DELETE(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    store.deleteTokensByUser(auth.userId);
    return NextResponse.json({ message: 'Logged out successfully' });
}
