import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();
        if (!phone) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        store.createOtp(phone, otp);
        console.log(`📱 OTP for ${phone}: ${otp}`);

        return NextResponse.json({ message: 'OTP sent successfully (check server console)' });
    } catch {
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
