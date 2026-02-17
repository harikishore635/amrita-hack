import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { store } from '@/lib/store';
import { generateAccessToken, generateRefreshToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, phone } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
        }

        if (store.findUserByEmail(email)) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        const hashed = bcrypt.hashSync(password, 10);
        const user = store.createUser({ email, password: hashed, name, phone: phone || null });

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);
        store.storeToken(refreshToken, user.id);

        if (phone) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            store.createOtp(phone, otp);
            console.log(`📱 OTP for ${phone}: ${otp}`);
        }

        return NextResponse.json({
            message: 'Registration successful',
            accessToken, refreshToken,
            user: { id: user.id, email: user.email, name: user.name, phone: user.phone, phoneVerified: user.phoneVerified, role: user.role },
        }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
