// ─────────────────────────────────────────────
// In-Memory Data Store for PensionChain
// Auto-seeds with demo data on cold start
// ─────────────────────────────────────────────
import bcrypt from 'bcryptjs';

export interface User {
    id: string; email: string; password: string; name: string;
    phone: string | null; phoneVerified: boolean;
    age: number | null; monthlyIncome: string | null;
    riskProfile: string; role: string;
    walletAddress: string | null; currentEmployerId: string | null;
    createdAt: Date; updatedAt: Date;
}

export interface Employer {
    id: string; companyName: string; gstNumber: string | null;
    matchPercentage: number; userId: string;
    createdAt: Date; updatedAt: Date;
}

export interface Contribution {
    id: string; userId: string; amount: number; employerMatch: number;
    type: string; paymentMethod: string; paymentStatus: string;
    txHash: string | null; employerId: string | null; createdAt: Date;
}

export interface OtpRecord {
    id: string; phone: string; otp: string;
    expiresAt: Date; verified: boolean; createdAt: Date;
}

export interface ChatMsg {
    id: string; userId: string; role: string;
    content: string; language: string; createdAt: Date;
}

export interface RefToken {
    id: string; token: string; userId: string;
    expiresAt: Date; createdAt: Date;
}

class DataStore {
    users: User[] = [];
    employers: Employer[] = [];
    contributions: Contribution[] = [];
    otps: OtpRecord[] = [];
    chats: ChatMsg[] = [];
    tokens: RefToken[] = [];
    private counter = 0;
    seeded = false;

    uid(): string {
        return `id${++this.counter}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }

    // ── User ──
    findUserByEmail(email: string) { return this.users.find(u => u.email === email); }
    findUserById(id: string) { return this.users.find(u => u.id === id); }
    findUserByPhone(phone: string) { return this.users.find(u => u.phone === phone); }

    createUser(d: Partial<User>): User {
        const u: User = {
            id: this.uid(), email: d.email!, password: d.password!, name: d.name!,
            phone: d.phone || null, phoneVerified: d.phoneVerified || false,
            age: d.age || null, monthlyIncome: d.monthlyIncome || null,
            riskProfile: d.riskProfile || 'Balanced', role: d.role || 'worker',
            walletAddress: d.walletAddress || null, currentEmployerId: d.currentEmployerId || null,
            createdAt: d.createdAt || new Date(), updatedAt: new Date(),
        };
        this.users.push(u);
        return u;
    }

    updateUser(id: string, d: Partial<User>): User | null {
        const u = this.findUserById(id);
        if (!u) return null;
        Object.assign(u, d, { updatedAt: new Date() });
        return u;
    }

    // ── Employer ──
    findEmployerByUserId(userId: string) { return this.employers.find(e => e.userId === userId); }
    findEmployerById(id: string) { return this.employers.find(e => e.id === id); }

    createEmployer(d: Partial<Employer>): Employer {
        const e: Employer = {
            id: this.uid(), companyName: d.companyName!, gstNumber: d.gstNumber || null,
            matchPercentage: d.matchPercentage || 50, userId: d.userId!,
            createdAt: new Date(), updatedAt: new Date(),
        };
        this.employers.push(e);
        return e;
    }

    // ── Contribution ──
    getContributions(userId: string, opts?: { types?: string[]; limit?: number; skip?: number }) {
        let items = this.contributions.filter(c => c.userId === userId);
        if (opts?.types) items = items.filter(c => opts.types!.includes(c.type));
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const total = items.length;
        if (opts?.skip) items = items.slice(opts.skip);
        if (opts?.limit) items = items.slice(0, opts.limit);
        return { items, total };
    }

    sumContributions(userId: string, types: string[]): { sum: number; count: number } {
        const items = this.contributions.filter(c => c.userId === userId && types.includes(c.type));
        return { sum: items.reduce((s, c) => s + c.amount, 0), count: items.length };
    }

    sumContributionsSince(userId: string, types: string[], since: Date) {
        const items = this.contributions.filter(c =>
            c.userId === userId && types.includes(c.type) && c.createdAt >= since
        );
        return items.reduce((s, c) => s + c.amount, 0);
    }

    addContribution(d: Partial<Contribution>): Contribution {
        const c: Contribution = {
            id: this.uid(), userId: d.userId!, amount: d.amount!, employerMatch: d.employerMatch || 0,
            type: d.type || 'contribution', paymentMethod: d.paymentMethod || 'upi',
            paymentStatus: d.paymentStatus || 'completed', txHash: d.txHash || null,
            employerId: d.employerId || null, createdAt: d.createdAt || new Date(),
        };
        this.contributions.push(c);
        return c;
    }

    // ── OTP ──
    createOtp(identifier: string, otp: string) {
        this.otps.push({
            id: this.uid(), phone: identifier, otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            verified: false, createdAt: new Date(),
        });
    }

    verifyOtp(identifier: string, otp: string): boolean {
        const rec = this.otps.filter(o =>
            o.phone === identifier && o.otp === otp && !o.verified && o.expiresAt > new Date()
        ).pop();
        if (!rec) return false;
        rec.verified = true;
        // Check if identifier is email or phone
        const userByPhone = this.findUserByPhone(identifier);
        const userByEmail = this.findUserByEmail(identifier);
        if (userByPhone) userByPhone.phoneVerified = true;
        if (userByEmail) userByEmail.phoneVerified = true;
        return true;
    }

    // ── Chat ──
    getChats(userId: string, limit: number) {
        return this.chats
            .filter(c => c.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit)
            .reverse();
    }

    addChat(userId: string, role: string, content: string, language: string) {
        this.chats.push({ id: this.uid(), userId, role, content, language, createdAt: new Date() });
    }

    // ── Refresh Tokens ──
    storeToken(token: string, userId: string) {
        this.tokens.push({
            id: this.uid(), token, userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date(),
        });
    }

    findToken(token: string) { return this.tokens.find(t => t.token === token); }
    deleteTokensByUser(userId: string) { this.tokens = this.tokens.filter(t => t.userId !== userId); }

    // ── Employees of an employer ──
    getEmployees(employerId: string) {
        return this.users.filter(u => u.currentEmployerId === employerId);
    }

    // ── Seed ──
    seed() {
        if (this.seeded) return;
        this.seeded = true;

        const pw = bcrypt.hashSync('worker123', 10);
        const epw = bcrypt.hashSync('employer123', 10);

        // Employer user
        const eu = this.createUser({
            email: 'employer@abc.com', password: epw, name: 'Admin - ABC Construction',
            phone: '9000000001', phoneVerified: true, role: 'employer', age: 45,
        });
        const emp = this.createEmployer({
            companyName: 'ABC Construction Pvt Ltd', gstNumber: '29ABCDE1234F1Z5',
            matchPercentage: 50, userId: eu.id,
        });

        // Main worker
        const w = this.createUser({
            email: 'ramesh@pension.com', password: pw, name: 'Ramesh Kumar',
            phone: '9876543210', phoneVerified: true, role: 'worker', age: 36,
            monthlyIncome: '₹10,000 - ₹20,000', riskProfile: 'Balanced',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
            currentEmployerId: emp.id,
            createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // joined ~13 months ago
        });

        // Additional workers
        const extras = [
            { name: 'Suresh Patel', email: 'suresh@pension.com', phone: '9876543211', age: 28 },
            { name: 'Mohammed Ali', email: 'mohammed@pension.com', phone: '9876543212', age: 42 },
            { name: 'Lakshmi Devi', email: 'lakshmi@pension.com', phone: '9876543213', age: 35 },
            { name: 'Ravi Singh', email: 'ravi@pension.com', phone: '9876543214', age: 31 },
        ];
        for (const x of extras) {
            this.createUser({
                email: x.email, password: pw, name: x.name, phone: x.phone,
                phoneVerified: true, role: 'worker', age: x.age,
                monthlyIncome: '₹10,000 - ₹20,000', riskProfile: 'Balanced',
                currentEmployerId: emp.id,
            });
        }

        // 30 days of contributions for Ramesh
        const now = Date.now();
        for (let day = 30; day >= 0; day--) {
            const date = new Date(now - day * 24 * 60 * 60 * 1000);
            this.addContribution({ userId: w.id, amount: 10, type: 'contribution', paymentMethod: 'upi', createdAt: date });
            this.addContribution({ userId: w.id, amount: 5, employerMatch: 5, type: 'match', paymentMethod: 'employer', employerId: emp.id, createdAt: date });
            if (day % 7 === 0) {
                this.addContribution({ userId: w.id, amount: Math.round(Math.random() * 15 + 5), type: 'yield', paymentMethod: 'defi', createdAt: date });
            }
        }

        // 12 months of historical data
        for (let m = 1; m <= 12; m++) {
            const d = new Date(now - m * 30 * 24 * 60 * 60 * 1000);
            this.addContribution({ userId: w.id, amount: 300, type: 'contribution', paymentMethod: 'upi', createdAt: d });
            this.addContribution({ userId: w.id, amount: 150, employerMatch: 150, type: 'match', paymentMethod: 'employer', employerId: emp.id, createdAt: d });
        }

        console.log('🌱 Store seeded: ramesh@pension.com / worker123 | employer@abc.com / employer123');
    }
}

// Global singleton (survives hot reloads in dev, persists in same serverless container)
const g = globalThis as unknown as { __pensionStore: DataStore };
if (!g.__pensionStore) {
    g.__pensionStore = new DataStore();
    g.__pensionStore.seed();
}
export const store = g.__pensionStore;
