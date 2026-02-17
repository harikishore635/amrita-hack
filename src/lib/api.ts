// Empty string = same-origin (Netlify deployment, Next.js API routes)
// Set NEXT_PUBLIC_API_URL=http://localhost:5000 in .env.local to use separate Express backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// ─────────────────────────────────────────────
// Token management
// ─────────────────────────────────────────────
function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pensionchain_access_token');
}

function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pensionchain_refresh_token');
}

export function setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('pensionchain_access_token', accessToken);
    localStorage.setItem('pensionchain_refresh_token', refreshToken);
}

export function clearTokens() {
    localStorage.removeItem('pensionchain_access_token');
    localStorage.removeItem('pensionchain_refresh_token');
    localStorage.removeItem('pensionchain_user');
}

export function setUser(user: any) {
    localStorage.setItem('pensionchain_user', JSON.stringify(user));
}

export function getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('pensionchain_user');
    return stored ? JSON.parse(stored) : null;
}

// ─────────────────────────────────────────────
// API fetcher with auto token refresh
// ─────────────────────────────────────────────
async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE}${endpoint}`;
    const token = getAccessToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, { ...options, headers });

    // If 401, try to refresh the token
    if (response.status === 401 && getRefreshToken()) {
        const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: getRefreshToken() }),
        });

        if (refreshResponse.ok) {
            const { accessToken } = await refreshResponse.json();
            localStorage.setItem('pensionchain_access_token', accessToken);
            headers['Authorization'] = `Bearer ${accessToken}`;
            response = await fetch(url, { ...options, headers });
        } else {
            clearTokens();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Session expired');
        }
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// ─────────────────────────────────────────────
// Auth APIs
// ─────────────────────────────────────────────
export const authAPI = {
    register: (data: { email: string; password: string; name: string; phone?: string }) =>
        apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    login: (data: { email: string; password: string }) =>
        apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    sendOtp: (phone: string) =>
        apiFetch('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),

    sendEmailOtp: (email: string) =>
        apiFetch('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),

    verifyOtp: (phone: string, otp: string) =>
        apiFetch('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),

    verifyEmailOtp: (email: string, otp: string) =>
        apiFetch('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),

    logout: () =>
        apiFetch('/api/auth/logout', { method: 'DELETE', body: JSON.stringify({ refreshToken: getRefreshToken() }) }),
};

// ─────────────────────────────────────────────
// User APIs
// ─────────────────────────────────────────────
export const userAPI = {
    getProfile: () => apiFetch('/api/user/profile'),

    updateProfile: (data: { name?: string; age?: number; monthlyIncome?: string; riskProfile?: string }) =>
        apiFetch('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// ─────────────────────────────────────────────
// Pension APIs
// ─────────────────────────────────────────────
export const pensionAPI = {
    getBalance: () => apiFetch('/api/pension/balance'),

    getContributions: (page = 1, limit = 20) =>
        apiFetch(`/api/pension/contributions?page=${page}&limit=${limit}`),

    contribute: (amount: number, paymentMethod = 'upi') =>
        apiFetch('/api/pension/contribute', { method: 'POST', body: JSON.stringify({ amount, paymentMethod }) }),

    getProjection: () => apiFetch('/api/pension/projection'),

    getWithdrawInfo: () => apiFetch('/api/pension/withdraw'),

    withdraw: (amount: number, reason?: string) =>
        apiFetch('/api/pension/withdraw', { method: 'POST', body: JSON.stringify({ amount, reason }) }),

    getTransferRecord: () => apiFetch('/api/pension/switch-job'),

    switchJob: (newEmployerName: string, matchPercentage?: number) =>
        apiFetch('/api/pension/switch-job', { method: 'POST', body: JSON.stringify({ newEmployerName, matchPercentage }) }),
};

// ─────────────────────────────────────────────
// AI APIs
// ─────────────────────────────────────────────
export const aiAPI = {
    chat: (message: string, language = 'en') =>
        apiFetch('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message, language }) }),

    getSuggestions: () => apiFetch('/api/ai/suggestions'),
};

// ─────────────────────────────────────────────
// Payment APIs
// ─────────────────────────────────────────────
export const paymentAPI = {
    simulate: (amount: number, upiId?: string) =>
        apiFetch('/api/payment/simulate', { method: 'POST', body: JSON.stringify({ amount, upiId }) }),

    getHistory: () => apiFetch('/api/payment/history'),
};

// ─────────────────────────────────────────────
// Blockchain APIs
// ─────────────────────────────────────────────
export const blockchainAPI = {
    createWallet: () => apiFetch('/api/blockchain/create-wallet', { method: 'POST' }),

    getWalletBalance: () => apiFetch('/api/blockchain/wallet-balance'),

    getTransactions: () => apiFetch('/api/blockchain/transactions'),

    getWalletStatus: () => apiFetch('/api/blockchain/self-transfer'),

    selfTransfer: () => apiFetch('/api/blockchain/self-transfer', { method: 'POST' }),
};

// ─────────────────────────────────────────────
// Employer APIs
// ─────────────────────────────────────────────
export const employerAPI = {
    getEmployees: () => apiFetch('/api/employer/employees'),

    bulkContribute: (employeeIds: string[], amount: number) =>
        apiFetch('/api/employer/bulk-contribute', { method: 'POST', body: JSON.stringify({ employeeIds, amount }) }),
};
