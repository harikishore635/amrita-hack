import nodemailer from 'nodemailer';

// Uses Brevo (Sendinblue) free SMTP - 300 emails/day free
// Or Gmail SMTP with App Password
// Falls back to Ethereal (test email service) if nothing configured
let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
    if (transporter) return transporter;

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
        // Use configured SMTP (Brevo, Gmail, etc.)
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: { user: smtpUser, pass: smtpPass },
        });
    } else {
        // Fallback: Ethereal test account (emails viewable at ethereal.email)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log('📧 Using Ethereal test email. View sent emails at: https://ethereal.email');
        console.log(`   Ethereal credentials: ${testAccount.user} / ${testAccount.pass}`);
    }

    return transporter;
}

export async function sendOtpEmail(email: string, otp: string): Promise<{ success: boolean; previewUrl?: string | false }> {
    try {
        const transport = await getTransporter();

        const info = await transport.sendMail({
            from: process.env.SMTP_FROM || '"PensionChain" <noreply@pensionchain.in>',
            to: email,
            subject: `Your PensionChain Verification Code: ${otp}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); line-height: 48px; font-size: 20px; font-weight: bold; color: #000;">P</div>
                        <h1 style="color: #f59e0b; margin: 12px 0 4px; font-size: 20px;">PensionChain</h1>
                        <p style="color: #9ca3af; font-size: 13px; margin: 0;">Blockchain-Powered Pension for Every Worker</p>
                    </div>
                    <div style="text-align: center; padding: 24px; background: #111; border-radius: 12px; border: 1px solid #333;">
                        <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px;">Your verification code is:</p>
                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f59e0b; padding: 12px;">${otp}</div>
                        <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0;">This code expires in 10 minutes</p>
                    </div>
                    <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 24px;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            `,
            text: `Your PensionChain verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`📧 Preview email at: ${previewUrl}`);
        }

        return { success: true, previewUrl };
    } catch (err: any) {
        console.error('Email send failed:', err.message);
        return { success: false };
    }
}
