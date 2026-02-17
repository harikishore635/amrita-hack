import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { store } from '@/lib/store';
import { generateAccessToken, generateRefreshToken } from '@/lib/server-auth';
import { verifyFileOTP } from '@/lib/otp-file';

const JWT_SECRET = process.env.JWT_SECRET || 'pensionchain-secret-key-change-in-production';

export async function POST(req: NextRequest) {
    try {
        const { phone, email, otp, pendingToken } = await req.json();

        // ── 2FA Login Verification (pendingToken + otp) ──
        if (pendingToken && otp) {
            // Decode the pending token to get user info
            let decoded: any;
            try {
                decoded = jwt.verify(pendingToken, JWT_SECRET);
            } catch {
                return NextResponse.json({ error: 'OTP session expired. Please login again.' }, { status: 401 });
            }

            if (decoded.purpose !== '2fa-pending') {
                return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
            }

            // Verify OTP from file
            const isValid = verifyFileOTP(decoded.email, otp);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid or expired OTP. Check the .otp/ folder for the correct code.' }, { status: 400 });
            }

            // OTP verified! Issue real auth tokens
            const user = store.findUserById(decoded.userId);
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const accessToken = generateAccessToken(user.id, user.role);
            const refreshToken = generateRefreshToken(user.id);
            store.storeToken(refreshToken, user.id);

            return NextResponse.json({
                message: '2FA verification successful. Login complete!',
                step: 'login_complete',
                accessToken,
                refreshToken,
                user: {
                    id: user.id, email: user.email, name: user.name, phone: user.phone,
                    phoneVerified: user.phoneVerified, role: user.role, age: user.age,
                    monthlyIncome: user.monthlyIncome, riskProfile: user.riskProfile,
                    walletAddress: user.walletAddress,
                },
            });
        }

        // ── Legacy phone/email OTP verification (registration flow) ──
        const identifier = email || phone;
        if (!identifier || !otp) {
            return NextResponse.json({ error: 'Identifier and OTP are required' }, { status: 400 });
        }

        if (!store.verifyOtp(identifier, otp)) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        return NextResponse.json({ message: email ? 'Email verified successfully' : 'Phone verified successfully' });
    } catch {
        return NextResponse.json({ error: 'OTP verification failed' }, { status: 500 });
    }
}
