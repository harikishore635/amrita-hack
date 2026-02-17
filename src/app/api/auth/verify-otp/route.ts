import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(req: NextRequest) {
    try {
        const { phone, email, otp } = await req.json();
        const identifier = email || phone;

        if (!identifier || !otp) return NextResponse.json({ error: 'Identifier and OTP are required' }, { status: 400 });

        if (!store.verifyOtp(identifier, otp)) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        return NextResponse.json({ message: email ? 'Email verified successfully' : 'Phone verified successfully' });
    } catch {
        return NextResponse.json({ error: 'OTP verification failed' }, { status: 500 });
    }
}
