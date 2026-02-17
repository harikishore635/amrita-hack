import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { sendOtpEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { phone, email } = await req.json();
        const identifier = email || phone;

        if (!identifier) return NextResponse.json({ error: 'Email or phone number is required' }, { status: 400 });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        store.createOtp(identifier, otp);

        if (email) {
            // Send OTP via email
            const result = await sendOtpEmail(email, otp);
            if (result.success) {
                console.log(`📧 OTP for ${email}: ${otp}`);
                return NextResponse.json({
                    message: 'OTP sent to your email',
                    ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
                });
            } else {
                // Email failed - still store OTP and log to console as fallback
                console.log(`📱 OTP for ${email} (email failed, check console): ${otp}`);
                return NextResponse.json({ message: 'OTP generated (check server console if email not received)' });
            }
        } else {
            // Phone OTP - log to console (SMS integration would go here)
            console.log(`📱 OTP for ${phone}: ${otp}`);
            return NextResponse.json({ message: 'OTP sent successfully (check server console)' });
        }
    } catch {
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
