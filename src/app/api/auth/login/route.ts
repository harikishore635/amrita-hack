import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { store } from '@/lib/store';
import { generateAccessToken, generateRefreshToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const user = store.findUserByEmail(email);
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);
        store.storeToken(refreshToken, user.id);

        return NextResponse.json({
            message: 'Login successful',
            accessToken, refreshToken,
            user: {
                id: user.id, email: user.email, name: user.name, phone: user.phone,
                phoneVerified: user.phoneVerified, role: user.role, age: user.age,
                monthlyIncome: user.monthlyIncome, riskProfile: user.riskProfile,
                walletAddress: user.walletAddress,
            },
        });
    } catch (e: any) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
