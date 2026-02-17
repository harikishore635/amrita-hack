import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(req: NextRequest) {
    try {
        const { phone, otp } = await req.json();
        if (!phone || !otp) return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });

        if (!store.verifyOtp(phone, otp)) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Phone verified successfully' });
    } catch {
        return NextResponse.json({ error: 'OTP verification failed' }, { status: 500 });
    }
}
