// ─────────────────────────────────────────────
// Persistent Data Store for PensionChain
// Saves to .data/store.json so data survives restarts
// ─────────────────────────────────────────────
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

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

// ─────────────────────────────────────────────
// Persistence helpers
// ─────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function ensureDataDir() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
    } catch { /* ignore in read-only environments */ }
}

function saveToFile(data: {
    users: User[];
    employers: Employer[];
    contributions: Contribution[];
    chats: ChatMsg[];
    tokens: RefToken[];
    counter: number;
}) {
    try {
        ensureDataDir();
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        // Silently fail in read-only environments (e.g. serverless)
        console.warn('[Store] Could not persist data to file:', (err as Error).message);
    }
}

function loadFromFile(): {
    users: User[];
    employers: Employer[];
    contributions: Contribution[];
    chats: ChatMsg[];
    tokens: RefToken[];
    counter: number;
} | null {
    try {
        if (!fs.existsSync(DATA_FILE)) return null;
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);

        // Rehydrate Date objects from JSON strings
        const rehydrateDates = (arr: any[], fields: string[]) =>
            arr.map(item => {
                const out = { ...item };
                for (const f of fields) {
                    if (out[f]) out[f] = new Date(out[f]);
                }
                return out;
            });

        data.users = rehydrateDates(data.users || [], ['createdAt', 'updatedAt']);
        data.employers = rehydrateDates(data.employers || [], ['createdAt', 'updatedAt']);
        data.contributions = rehydrateDates(data.contributions || [], ['createdAt']);
        data.chats = rehydrateDates(data.chats || [], ['createdAt']);
        data.tokens = rehydrateDates(data.tokens || [], ['expiresAt', 'createdAt']);

        return data;
    } catch (err) {
        console.warn('[Store] Could not load data from file:', (err as Error).message);
        return null;
    }
}

// ─────────────────────────────────────────────
// DataStore class
// ─────────────────────────────────────────────
class DataStore {
    users: User[] = [];
    employers: Employer[] = [];
    contributions: Contribution[] = [];
    otps: OtpRecord[] = [];
    chats: ChatMsg[] = [];
    tokens: RefToken[] = [];
    private counter = 0;
    seeded = false;
    private _saveTimer: ReturnType<typeof setTimeout> | null = null;

    uid(): string {
        return `id${++this.counter}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }

    // Debounced persistence — saves at most once every 500ms
    private _scheduleSave() {
        if (this._saveTimer) return;
        this._saveTimer = setTimeout(() => {
            this._saveTimer = null;
            saveToFile({
                users: this.users,
                employers: this.employers,
                contributions: this.contributions,
                chats: this.chats,
                tokens: this.tokens,
                counter: this.counter,
            });
        }, 500);
    }

    // Load persisted data (returns true if loaded successfully)
    loadFromDisk(): boolean {
        const data = loadFromFile();
        if (!data || !data.users || data.users.length === 0) return false;
        this.users = data.users;
        this.employers = data.employers || [];
        this.contributions = data.contributions || [];
        this.chats = data.chats || [];
        this.tokens = data.tokens || [];
        this.counter = data.counter || 100;
        this.seeded = true;
        console.log(`📂 Store loaded from disk: ${this.users.length} users, ${this.contributions.length} contributions`);
        return true;
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
        this._scheduleSave();
        return u;
    }

    updateUser(id: string, d: Partial<User>): User | null {
        const u = this.findUserById(id);
        if (!u) return null;
        Object.assign(u, d, { updatedAt: new Date() });
        this._scheduleSave();
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
        this._scheduleSave();
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
        this._scheduleSave();
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
        this._scheduleSave();
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
        this._scheduleSave();
    }

    // ── Refresh Tokens ──
    storeToken(token: string, userId: string) {
        this.tokens.push({
            id: this.uid(), token, userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date(),
        });
        this._scheduleSave();
    }

    findToken(token: string) { return this.tokens.find(t => t.token === token); }
    deleteTokensByUser(userId: string) {
        this.tokens = this.tokens.filter(t => t.userId !== userId);
        this._scheduleSave();
    }

    // ── Employees of an employer ──
    getEmployees(employerId: string) {
        return this.users.filter(u => u.currentEmployerId === employerId);
    }

    // ── Transfer between users ──
    addTransfer(d: { fromUserId: string; toUserId: string; amount: number; note?: string; txHash?: string }): Contribution {
        // Debit from sender
        const debit = this.addContribution({
            userId: d.fromUserId, amount: d.amount, type: 'transfer_out',
            paymentMethod: 'internal', txHash: d.txHash || `TXF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        });
        // Credit to receiver
        this.addContribution({
            userId: d.toUserId, amount: d.amount, type: 'transfer_in',
            paymentMethod: 'internal', txHash: debit.txHash,
        });
        return debit;
    }

    // ── Seed ──
    seed() {
        if (this.seeded) return;
        this.seeded = true;

        const pw = bcrypt.hashSync('worker123', 10);
        const epw = bcrypt.hashSync('employer123', 10);

        // ═══════════════════════════════════════
        // EMPLOYER 1: ABC Construction
        // ═══════════════════════════════════════
        const eu1 = this.createUser({
            email: 'employer1@pensionchain.com', password: epw, name: 'Rajesh Sharma - ABC Construction',
            phone: '9000000001', phoneVerified: true, role: 'employer', age: 45,
        });
        const emp1 = this.createEmployer({
            companyName: 'ABC Construction Pvt Ltd', gstNumber: '29ABCDE1234F1Z5',
            matchPercentage: 50, userId: eu1.id,
        });

        // ═══════════════════════════════════════
        // EMPLOYER 2: XYZ Textiles
        // ═══════════════════════════════════════
        const eu2 = this.createUser({
            email: 'employer2@pensionchain.com', password: epw, name: 'Priya Patel - XYZ Textiles',
            phone: '9000000002', phoneVerified: true, role: 'employer', age: 38,
        });
        const emp2 = this.createEmployer({
            companyName: 'XYZ Textiles Ltd', gstNumber: '27XYZAB5678G2H3',
            matchPercentage: 60, userId: eu2.id,
        });

        // ═══════════════════════════════════════
        // WORKER 1: Ramesh Kumar (under ABC Construction)
        // ═══════════════════════════════════════
        const w1 = this.createUser({
            email: 'worker1@pensionchain.com', password: pw, name: 'Ramesh Kumar',
            phone: '9876543210', phoneVerified: true, role: 'worker', age: 36,
            monthlyIncome: '₹10,000 - ₹20,000', riskProfile: 'Balanced',
            walletAddress: '0xa6dF377eBf1AB4EaD308b5A3afCAae4e44175d81',
            currentEmployerId: emp1.id,
            createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
        });

        // ═══════════════════════════════════════
        // WORKER 2: Lakshmi Devi (under XYZ Textiles)
        // ═══════════════════════════════════════
        const w2 = this.createUser({
            email: 'worker2@pensionchain.com', password: pw, name: 'Lakshmi Devi',
            phone: '9876543213', phoneVerified: true, role: 'worker', age: 35,
            monthlyIncome: '₹15,000 - ₹25,000', riskProfile: 'Conservative',
            walletAddress: '0xBb2C4dE538a9F12345678901234567890abcdEFa',
            currentEmployerId: emp2.id,
            createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
        });

        // ── Seed contributions for Worker 1 (last 7 days) ──
        const now = Date.now();
        for (let day = 6; day >= 0; day--) {
            const date = new Date(now - day * 24 * 60 * 60 * 1000);
            this.addContribution({ userId: w1.id, amount: 10, type: 'contribution', paymentMethod: 'upi', createdAt: date });
            this.addContribution({ userId: w1.id, amount: 5, employerMatch: 5, type: 'match', paymentMethod: 'employer', employerId: emp1.id, createdAt: date });
        }
        // Monthly history for Worker 1
        for (let month = 1; month <= 6; month++) {
            const mDate = new Date(now - month * 30 * 24 * 60 * 60 * 1000);
            this.addContribution({ userId: w1.id, amount: 300, type: 'contribution', paymentMethod: 'upi', createdAt: mDate });
            this.addContribution({ userId: w1.id, amount: 150, employerMatch: 150, type: 'match', paymentMethod: 'employer', employerId: emp1.id, createdAt: mDate });
        }

        // ── Seed contributions for Worker 2 (last 7 days) ──
        for (let day = 6; day >= 0; day--) {
            const date = new Date(now - day * 24 * 60 * 60 * 1000);
            this.addContribution({ userId: w2.id, amount: 15, type: 'contribution', paymentMethod: 'upi', createdAt: date });
            this.addContribution({ userId: w2.id, amount: 9, employerMatch: 9, type: 'match', paymentMethod: 'employer', employerId: emp2.id, createdAt: date });
        }
        // Monthly history for Worker 2
        for (let month = 1; month <= 4; month++) {
            const mDate = new Date(now - month * 30 * 24 * 60 * 60 * 1000);
            this.addContribution({ userId: w2.id, amount: 450, type: 'contribution', paymentMethod: 'upi', createdAt: mDate });
            this.addContribution({ userId: w2.id, amount: 270, employerMatch: 270, type: 'match', paymentMethod: 'employer', employerId: emp2.id, createdAt: mDate });
        }

        // ── Seed cross-user transfers (demo: worker1 → worker2 and back) ──
        this.addTransfer({ fromUserId: w1.id, toUserId: w2.id, amount: 25, note: 'Shared savings' });
        this.addTransfer({ fromUserId: w2.id, toUserId: w1.id, amount: 10, note: 'Return partial' });

        // ── Employer bulk contributions (employers → their workers) ──
        this.addContribution({ userId: w1.id, amount: 50, employerMatch: 50, type: 'match', paymentMethod: 'employer', employerId: emp1.id });
        this.addContribution({ userId: w2.id, amount: 75, employerMatch: 75, type: 'match', paymentMethod: 'employer', employerId: emp2.id });

        console.log('🌱 Store seeded with 4 users (2 workers + 2 employers):');
        console.log('─────────────────────────────────────────────────');
        console.log('  Worker 1:   worker1@pensionchain.com   / worker123');
        console.log('  Worker 2:   worker2@pensionchain.com   / worker123');
        console.log('  Employer 1: employer1@pensionchain.com / employer123');
        console.log('  Employer 2: employer2@pensionchain.com / employer123');
        console.log('─────────────────────────────────────────────────');
    }
}

// Global singleton (survives hot reloads in dev, persists across restarts via file)
const g = globalThis as unknown as { __pensionStore: DataStore };
if (!g.__pensionStore) {
    g.__pensionStore = new DataStore();
    // Try loading from disk first; if no saved data, seed fresh
    const loaded = g.__pensionStore.loadFromDisk();
    if (!loaded) {
        g.__pensionStore.seed();
    }
}
export const store = g.__pensionStore;
