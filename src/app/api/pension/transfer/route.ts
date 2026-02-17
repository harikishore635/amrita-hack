import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';

// POST: Transfer money from current user to another user
export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { toEmail, toUserId, amount, note } = await req.json();
    if (!amount || amount < 1) return NextResponse.json({ error: 'Amount must be at least ₹1' }, { status: 400 });
    if (!toEmail && !toUserId) return NextResponse.json({ error: 'Recipient email or ID is required' }, { status: 400 });

    const sender = store.findUserById(auth.userId);
    if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 });

    // Find recipient
    const recipient = toUserId ? store.findUserById(toUserId) : store.findUserByEmail(toEmail);
    if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    if (recipient.id === sender.id) return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 });

    // Check sender's available balance
    const total = store.sumContributions(sender.id, ['contribution', 'match', 'yield', 'transfer_in']);
    const outgoing = store.sumContributions(sender.id, ['withdrawal', 'transfer_out']);
    const available = total.sum - outgoing.sum;

    if (amount > available) {
        return NextResponse.json({
            error: `Insufficient balance. Available: ₹${Math.floor(available)}`,
            availableBalance: Math.floor(available),
        }, { status: 400 });
    }

    // Execute transfer
    const txHash = `TXF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Debit from sender
    store.addContribution({
        userId: sender.id, amount: parseFloat(amount), type: 'transfer_out',
        paymentMethod: 'internal', txHash,
    });
    // Credit to recipient
    store.addContribution({
        userId: recipient.id, amount: parseFloat(amount), type: 'transfer_in',
        paymentMethod: 'internal', txHash,
    });

    return NextResponse.json({
        success: true,
        message: `₹${amount} transferred to ${recipient.name} successfully!`,
        transfer: {
            id: txHash,
            from: { id: sender.id, name: sender.name, email: sender.email },
            to: { id: recipient.id, name: recipient.name, email: recipient.email },
            amount: parseFloat(amount),
            note: note || '',
            timestamp: new Date().toISOString(),
        },
    }, { status: 201 });
}

// GET: Get transfer history for current user
export async function GET(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items: outgoing } = store.getContributions(auth.userId, { types: ['transfer_out'] });
    const { items: incoming } = store.getContributions(auth.userId, { types: ['transfer_in'] });

    // Enrich with sender/recipient names by matching txHash
    const allUsers = store.users;
    const allContributions = store.contributions;

    const enrichTransfers = (transfers: typeof outgoing, direction: 'sent' | 'received') => {
        return transfers.map(t => {
            // Find the counterpart transaction (same txHash, different userId)
            const counterpart = allContributions.find(c =>
                c.txHash === t.txHash && c.userId !== auth.userId
            );
            const otherUser = counterpart ? allUsers.find(u => u.id === counterpart.userId) : null;

            return {
                id: t.id,
                txHash: t.txHash,
                amount: t.amount,
                direction,
                otherParty: otherUser ? { id: otherUser.id, name: otherUser.name, email: otherUser.email } : null,
                createdAt: t.createdAt,
            };
        });
    };

    const transfers = [
        ...enrichTransfers(outgoing, 'sent'),
        ...enrichTransfers(incoming, 'received'),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ transfers });
}
