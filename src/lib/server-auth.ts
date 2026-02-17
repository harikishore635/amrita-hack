import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'pensionchain-jwt-secret-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'pensionchain-refresh-secret-2026';

export function generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): { userId: string; role: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    } catch { return null; }
}

export function verifyRefreshTokenJWT(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    } catch { return null; }
}

/** Extract and verify user from Authorization header */
export function getAuthUser(req: NextRequest): { userId: string; role: string } | null {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    return verifyAccessToken(authHeader.split(' ')[1]);
}
