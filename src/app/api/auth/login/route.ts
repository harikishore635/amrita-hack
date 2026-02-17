import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store } from '@/lib/store';
import { generateAccessToken, generateRefreshToken } from '@/lib/server-auth';
import { generateAndSaveOTP } from '@/lib/otp-file';

const JWT_SECRET = process.env.JWT_SECRET || 'pensionchain-secret-key-change-in-production';

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

        // ── 2FA: Generate OTP and save to .otp/ folder ──
        const otp = generateAndSaveOTP(email);

        // Create a short-lived pending token (valid 5 min) so the verify-otp step can identify the user
        const pendingToken = jwt.sign(
            { userId: user.id, email: user.email, purpose: '2fa-pending' },
            JWT_SECRET,
            { expiresIn: '5m' }
        );

        return NextResponse.json({
            message: 'Credentials verified. OTP has been generated.',
            step: 'otp_required',
            pendingToken,
            email: user.email,
            otpHint: `Check the .otp/ folder for your OTP file`,
        });
    } catch (e: any) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
