/**
 * PensionChain - Concurrent 4-User Transaction Test Script
 * =========================================================
 * Tests all 4 users (2 workers + 2 employers) performing
 * transactions simultaneously on the same Netlify deployment.
 *
 * Usage:
 *   node scripts/test-concurrent-users.js [BASE_URL]
 *
 * Example:
 *   node scripts/test-concurrent-users.js https://your-site.netlify.app
 *   node scripts/test-concurrent-users.js http://localhost:3000
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const USERS = [
    { email: 'worker1@pensionchain.com', password: 'worker123', role: 'worker', name: 'Ramesh Kumar' },
    { email: 'worker2@pensionchain.com', password: 'worker123', role: 'worker', name: 'Lakshmi Devi' },
    { email: 'employer1@pensionchain.com', password: 'employer123', role: 'employer', name: 'Rajesh Sharma' },
    { email: 'employer2@pensionchain.com', password: 'employer123', role: 'employer', name: 'Priya Patel' },
];

let allTokens = {};    // { email: { accessToken, userId } }
let allUserIds = {};   // { email: userId }

async function apiCall(endpoint, method = 'GET', body = null, token = null) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(`${res.status}: ${data.error || JSON.stringify(data)}`);
    return data;
}

// ─────────────────────────────────────────────
// Step 1: Login all 4 users concurrently
// ─────────────────────────────────────────────
async function loginAllUsers() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  STEP 1: Login all 4 users concurrently');
    console.log('═══════════════════════════════════════════\n');

    const loginPromises = USERS.map(async (u) => {
        try {
            const data = await apiCall('/api/auth/login', 'POST', { email: u.email, password: u.password });
            allTokens[u.email] = { accessToken: data.accessToken, userId: data.user.id };
            allUserIds[u.email] = data.user.id;
            console.log(`  ✅ ${u.name} (${u.role}): Logged in successfully — ID: ${data.user.id}`);
            return true;
        } catch (err) {
            console.log(`  ❌ ${u.name} (${u.role}): Login failed — ${err.message}`);
            return false;
        }
    });

    const results = await Promise.all(loginPromises);
    const allLoggedIn = results.every(r => r);
    console.log(`\n  ${allLoggedIn ? '✅ All 4 users logged in!' : '⚠️  Some logins failed'}`);
    return allLoggedIn;
}

// ─────────────────────────────────────────────
// Step 2: All users fetch their profiles concurrently
// ─────────────────────────────────────────────
async function fetchAllProfiles() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  STEP 2: Fetch all profiles concurrently');
    console.log('═══════════════════════════════════════════\n');

    const profilePromises = USERS.map(async (u) => {
        const { accessToken } = allTokens[u.email];
        try {
            const data = await apiCall('/api/user/profile', 'GET', null, accessToken);
            console.log(`  ✅ ${u.name}: Role=${data.user?.role || data.role}, Email=${data.user?.email || data.email}`);
        } catch (err) {
            console.log(`  ❌ ${u.name}: ${err.message}`);
        }
    });

    await Promise.all(profilePromises);
}

// ─────────────────────────────────────────────
// Step 3: Workers contribute to pensions concurrently
// ─────────────────────────────────────────────
async function workersContribute() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  STEP 3: Workers contribute concurrently');
    console.log('═══════════════════════════════════════════\n');

    const workers = USERS.filter(u => u.role === 'worker');
    const contributePromises = workers.map(async (u) => {
        const { accessToken } = allTokens[u.email];
        const amount = u.email.includes('worker1') ? 50 : 75;
        try {
            const data = await apiCall('/api/pension/contribute', 'POST', { amount, paymentMethod: 'upi' }, accessToken);
            console.log(`  ✅ ${u.name}: Contributed ₹${amount} → Total added: ₹${data.totalAdded}`);
            if (data.employerMatch) {
                console.log(`     ↳ Employer match: ₹${data.employerMatch.amount}`);
            }
        } catch (err) {
            console.log(`  ❌ ${u.name}: ${err.message}`);
        }
    });

    await Promise.all(contributePromises);
}

// ─────────────────────────────────────────────
// Step 4: Employers do bulk contributions for their workers
// ─────────────────────────────────────────────
async function employersBulkContribute() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  STEP 4: Employers bulk-contribute');
    console.log('═══════════════════════════════════════════\n');

    const employers = USERS.filter(u => u.role === 'employer');
    const bulkPromises = employers.map(async (u) => {
        const { accessToken } = allTokens[u.email];
        try {
            // First get employees
            const empData = await apiCall('/api/employer/employees', 'GET', null, accessToken);
            const employeeIds = (empData.employees || []).map((e) => e.id);

            if (employeeIds.length === 0) {
                console.log(`  ⚠️  ${u.name}: No employees found`);
                return;
            }

            const data = await apiCall('/api/employer/bulk-contribute', 'POST', {
                employeeIds,
                amount: 20,
            }, accessToken);
            console.log(`  ✅ ${u.name}: Bulk contributed for ${employeeIds.length} employees — Total: ₹${data.totalAmount}`);
        } catch (err) {
            console.log(`  ❌ ${u.name}: ${err.message}`);
        }
    });

    await Promise.all(bulkPromises);
}

// ─────────────────────────────────────────────
// Step 5: Cross-user transfers (all 4 users send to each other)
// ─────────────────────────────────────────────
async function crossUserTransfers() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  STEP 5: Cross-user transfers (all→all)');
    console.log('═══════════════════════════════════════════\n');

    const transferPairs = [
        { from: 'worker1@pensionchain.com', to: 'worker2@pensionchain.com', amount: 15, note: 'Worker1 → Worker2' },
        { from: 'worker2@pensionchain.com', to: 'worker1@pensionchain.com', amount: 10, note: 'Worker2 → Worker1' },
        { from: 'worker1@pensionchain.com', to: 'employer1@pensionchain.com', amount: 5, note: 'Worker1 → Employer1' },
        { from: 'employer1@pensionchain.com', to: 'worker1@pensionchain.com', amount: 20, note: 'Employer1 → Worker1' },
        { from: 'employer2@pensionchain.com', to: 'worker2@pensionchain.com', amount: 30, note: 'Employer2 → Worker2' },
        { from: 'employer1@pensionchain.com', to: 'employer2@pensionchain.com', amount: 10, note: 'Employer1 → Employer2' },
    ];

    const transferPromises = transferPairs.map(async (t) => {
        const { accessToken } = allTokens[t.from];
        const toUserId = allUserIds[t.to];
        try {
            const data = await apiCall('/api/pension/transfer', 'POST', {
                toUserId,
                amount: t.amount,
                note: t.note,
            }, accessToken);
            console.log(`  ✅ ${t.note}: ₹${t.amount} — ${data.message}`);
        } catch (err) {
            console.log(`  ❌ ${t.note}: ${err.message}`);
        }
    });

    await Promise.all(transferPromises);
}

// ─────────────────────────────────────────────
// Step 6: Verify balances for all users
// ─────────────────────────────────────────────
async function verifyBalances() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  STEP 6: Verify balances (all 4 users)');
    console.log('═══════════════════════════════════════════\n');

    const balancePromises = USERS.map(async (u) => {
        const { accessToken } = allTokens[u.email];
        try {
            const data = await apiCall('/api/pension/balance', 'GET', null, accessToken);
            console.log(`  💰 ${u.name} (${u.role}): Balance ₹${data.balance || data.totalBalance || 0}`);
        } catch (err) {
            console.log(`  ❌ ${u.name}: ${err.message}`);
        }
    });

    await Promise.all(balancePromises);
}

// ─────────────────────────────────────────────
// Step 7: Verify transfer history
// ─────────────────────────────────────────────
async function verifyTransferHistory() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  STEP 7: Transfer history (all 4 users)');
    console.log('═══════════════════════════════════════════\n');

    const historyPromises = USERS.map(async (u) => {
        const { accessToken } = allTokens[u.email];
        try {
            const data = await apiCall('/api/pension/transfer', 'GET', null, accessToken);
            const transfers = data.transfers || [];
            const sent = transfers.filter(t => t.direction === 'sent');
            const received = transfers.filter(t => t.direction === 'received');
            console.log(`  📜 ${u.name}: ${sent.length} sent, ${received.length} received`);
        } catch (err) {
            console.log(`  ❌ ${u.name}: ${err.message}`);
        }
    });

    await Promise.all(historyPromises);
}

// ─────────────────────────────────────────────
// Step 8: UPI payment simulation (concurrent)
// ─────────────────────────────────────────────
async function concurrentPayments() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  STEP 8: Concurrent UPI payments');
    console.log('═══════════════════════════════════════════\n');

    const paymentPromises = USERS.map(async (u) => {
        const { accessToken } = allTokens[u.email];
        const amount = Math.floor(Math.random() * 50) + 10;
        try {
            const data = await apiCall('/api/payment/simulate', 'POST', { amount, upiId: `${u.email.split('@')[0]}@upi` }, accessToken);
            console.log(`  ✅ ${u.name}: UPI ₹${amount} — TxID: ${data.transaction?.id?.slice(0, 20)}...`);
        } catch (err) {
            console.log(`  ❌ ${u.name}: ${err.message}`);
        }
    });

    await Promise.all(paymentPromises);
}

// ─────────────────────────────────────────────
// RUN ALL TESTS
// ─────────────────────────────────────────────
async function main() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  PensionChain - 4 User Concurrent Test Suite    ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  Target: ${BASE_URL.padEnd(40)}║`);
    console.log(`║  Time:   ${new Date().toISOString().padEnd(40)}║`);
    console.log('╚══════════════════════════════════════════════════╝');

    const startTime = Date.now();

    // 1. Login
    const allLoggedIn = await loginAllUsers();
    if (!allLoggedIn) {
        console.log('\n⚠️  Not all users could log in. The app may need to be restarted to re-seed.');
        console.log('   Try: rm -rf .data/store.json && npm run dev\n');
    }

    // 2. Profiles (concurrent)
    await fetchAllProfiles();

    // 3. Workers contribute (concurrent)
    await workersContribute();

    // 4. Employers bulk contribute (concurrent)
    await employersBulkContribute();

    // 5. Cross-user transfers (concurrent)
    await crossUserTransfers();

    // 6. Verify balances
    await verifyBalances();

    // 7. Transfer history
    await verifyTransferHistory();

    // 8. Concurrent payments
    await concurrentPayments();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║          ALL TESTS COMPLETED!                   ║');
    console.log(`║  Total time: ${(elapsed + 's').padEnd(37)}║`);
    console.log('╚══════════════════════════════════════════════════╝\n');

    console.log('📋 Credentials for manual testing:');
    console.log('─────────────────────────────────────────────────────');
    console.log('  Worker 1:   worker1@pensionchain.com   / worker123');
    console.log('  Worker 2:   worker2@pensionchain.com   / worker123');
    console.log('  Employer 1: employer1@pensionchain.com / employer123');
    console.log('  Employer 2: employer2@pensionchain.com / employer123');
    console.log('─────────────────────────────────────────────────────');
    console.log('\n💡 To test 4 concurrent browser sessions on Netlify:');
    console.log('   1. Open 4 different browser profiles (or use Chrome + Firefox + Edge + Incognito)');
    console.log('   2. Navigate to your Netlify URL in each browser');
    console.log('   3. Log in with a different user in each');
    console.log('   4. Go to /transfer in each browser and send money between users');
    console.log('   All sessions share the same server-side store!\n');
}

main().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
