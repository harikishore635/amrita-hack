// ─────────────────────────────────────────────
// File-Based OTP System for 2FA
// Instead of sending real emails, OTPs are written to .otp/ folder
// Each user gets a text file: .otp/{email}.txt
// ─────────────────────────────────────────────
import fs from 'fs';
import path from 'path';

const OTP_DIR = path.join(process.cwd(), '.otp');
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function ensureOtpDir() {
    try {
        if (!fs.existsSync(OTP_DIR)) {
            fs.mkdirSync(OTP_DIR, { recursive: true });
        }
    } catch { /* ignore in read-only environments */ }
}

/**
 * Generate a 6-digit OTP and save it to .otp/{email}.txt
 * File format:
 *   OTP: 123456
 *   Generated: 2026-02-18T10:30:00.000Z
 *   Expires: 2026-02-18T10:35:00.000Z
 *   User: worker1@pensionchain.com
 *   Status: PENDING
 */
export function generateAndSaveOTP(email: string): string {
    ensureOtpDir();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const expires = new Date(now.getTime() + OTP_EXPIRY_MS);

    // Sanitize email for filename (replace @ and . with safe chars)
    const filename = sanitizeEmail(email) + '.txt';
    const filepath = path.join(OTP_DIR, filename);

    const content = [
        `════════════════════════════════════════`,
        `  PensionChain 2FA - One Time Password  `,
        `════════════════════════════════════════`,
        ``,
        `  OTP Code:  ${otp}`,
        ``,
        `  User:      ${email}`,
        `  Generated: ${now.toLocaleString()}`,
        `  Expires:   ${expires.toLocaleString()} (5 minutes)`,
        `  Status:    PENDING`,
        ``,
        `════════════════════════════════════════`,
        `  Enter this code in the login page to  `,
        `  complete your 2FA authentication.      `,
        `════════════════════════════════════════`,
    ].join('\n');

    try {
        fs.writeFileSync(filepath, content, 'utf-8');
        console.log(`🔐 OTP for ${email} saved to .otp/${filename}`);
    } catch (err) {
        console.error(`[OTP-File] Failed to write OTP file:`, (err as Error).message);
    }

    // Also store in memory for verification (with expiry)
    otpMemoryStore.set(email, { otp, expiresAt: expires });

    return otp;
}

/**
 * Verify an OTP for the given email
 * Returns true if valid, false otherwise
 * Marks the file as VERIFIED on success, EXPIRED/INVALID on failure
 */
export function verifyFileOTP(email: string, inputOtp: string): boolean {
    const record = otpMemoryStore.get(email);

    if (!record) {
        updateOtpFileStatus(email, 'INVALID - No OTP found');
        return false;
    }

    if (new Date() > record.expiresAt) {
        otpMemoryStore.delete(email);
        updateOtpFileStatus(email, 'EXPIRED');
        return false;
    }

    if (record.otp !== inputOtp) {
        updateOtpFileStatus(email, 'INVALID - Wrong code entered');
        return false;
    }

    // Success! Remove from memory and update file
    otpMemoryStore.delete(email);
    updateOtpFileStatus(email, 'VERIFIED ✓');
    return true;
}

/**
 * Update the status line in the OTP file
 */
function updateOtpFileStatus(email: string, status: string) {
    ensureOtpDir();
    const filename = sanitizeEmail(email) + '.txt';
    const filepath = path.join(OTP_DIR, filename);

    try {
        if (fs.existsSync(filepath)) {
            let content = fs.readFileSync(filepath, 'utf-8');
            content = content.replace(/Status:\s+.*/, `Status:    ${status}`);
            fs.writeFileSync(filepath, content, 'utf-8');
        }
    } catch { /* ignore */ }
}

/**
 * List all OTP files in the directory (for debugging)
 */
export function listOtpFiles(): string[] {
    ensureOtpDir();
    try {
        return fs.readdirSync(OTP_DIR).filter(f => f.endsWith('.txt'));
    } catch {
        return [];
    }
}

// Sanitize email for use as filename
function sanitizeEmail(email: string): string {
    return email.replace(/@/g, '_at_').replace(/\./g, '_');
}

// In-memory OTP store for verification (survives within the same process)
const otpMemoryMap = new Map<string, { otp: string; expiresAt: Date }>();

// Use globalThis to survive hot reloads in dev
const g = globalThis as unknown as { __otpMemoryStore: Map<string, { otp: string; expiresAt: Date }> };
if (!g.__otpMemoryStore) {
    g.__otpMemoryStore = new Map();
}
const otpMemoryStore = g.__otpMemoryStore;
