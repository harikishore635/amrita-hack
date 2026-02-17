import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { verifyRefreshTokenJWT, generateAccessToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
    try {
        const { refreshToken } = await req.json();
        if (!refreshToken) return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });

        const decoded = verifyRefreshTokenJWT(refreshToken);
        if (!decoded) return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });

        const stored = store.findToken(refreshToken);
        if (!stored || stored.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Refresh token expired' }, { status: 401 });
        }

        const user = store.findUserById(decoded.userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

        return NextResponse.json({ accessToken: generateAccessToken(user.id, user.role) });
    } catch {
        return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
    }
}
