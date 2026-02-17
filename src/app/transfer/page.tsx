'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { pensionAPI, userAPI } from '@/lib/api'

interface UserItem {
    id: string
    name: string
    email: string
    role: string
}

interface Transfer {
    id: string
    txHash: string
    amount: number
    direction: 'sent' | 'received'
    otherParty: { id: string; name: string; email: string } | null
    createdAt: string
}

export default function TransferPage() {
    const [users, setUsers] = useState<UserItem[]>([])
    const [transfers, setTransfers] = useState<Transfer[]>([])
    const [selectedUser, setSelectedUser] = useState('')
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchData()
    }, [isAuthenticated])

    const fetchData = async () => {
        try {
            setFetchLoading(true)
            const [usersRes, transfersRes] = await Promise.all([
                userAPI.listUsers(),
                pensionAPI.getTransfers(),
            ])
            setUsers(usersRes.users || [])
            setTransfers(transfersRes.transfers || [])
        } catch (err: any) {
            console.error('Failed to fetch data:', err)
        } finally {
            setFetchLoading(false)
        }
    }

    const handleTransfer = async () => {
        if (!selectedUser) { setError('Select a recipient'); return }
        if (!amount || parseFloat(amount) < 1) { setError('Amount must be at least ₹1'); return }
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const result = await pensionAPI.transfer(selectedUser, parseFloat(amount), note)
            setSuccess(result.message)
            setAmount('')
            setNote('')
            setSelectedUser('')
            // Refresh transfers
            const transfersRes = await pensionAPI.getTransfers()
            setTransfers(transfersRes.transfers || [])
        } catch (err: any) {
            setError(err.message || 'Transfer failed')
        } finally {
            setLoading(false)
        }
    }

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition">
                            ← Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold">💸 Transfer Money</h1>
                    </div>
                    <div className="text-sm text-gray-400">
                        Logged in as <span className="text-white font-medium">{user?.name}</span>
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-blue-600/30 text-blue-300 uppercase">{user?.role}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Transfer Form */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="text-2xl">🔄</span> Send Money
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
                            ✅ {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Recipient Selection */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Send To</label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                            >
                                <option value="" className="bg-gray-800">Select recipient...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id} className="bg-gray-800">
                                        {u.name} ({u.email}) — {u.role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Amount (₹)</label>
                            <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount..."
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Quick Amount Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {[10, 25, 50, 100, 250, 500].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setAmount(String(amt))}
                                    className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded-lg text-sm transition"
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Note (optional)</label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="What's this for?"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleTransfer}
                            disabled={loading || !selectedUser || !amount}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>💸 Send ₹{amount || '0'}</>
                            )}
                        </button>
                    </div>
                </div>

                {/* All Users */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-2xl">👥</span> All Users
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {users.map(u => (
                            <div
                                key={u.id}
                                onClick={() => setSelectedUser(u.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    selectedUser === u.id
                                        ? 'bg-blue-600/20 border-blue-500/50'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-sm text-gray-400">{u.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                                        u.role === 'employer' ? 'bg-purple-600/30 text-purple-300' : 'bg-green-600/30 text-green-300'
                                    }`}>
                                        {u.role}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transfer History */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-2xl">📜</span> Transfer History
                    </h2>
                    {transfers.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No transfers yet. Send money to get started!</p>
                    ) : (
                        <div className="space-y-3">
                            {transfers.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                                            t.direction === 'sent' ? 'bg-red-500/20' : 'bg-green-500/20'
                                        }`}>
                                            {t.direction === 'sent' ? '↗️' : '↙️'}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {t.direction === 'sent' ? 'Sent to' : 'Received from'}{' '}
                                                <span className="text-blue-300">{t.otherParty?.name || 'Unknown'}</span>
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {t.otherParty?.email} • {new Date(t.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-lg font-semibold ${
                                        t.direction === 'sent' ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                        {t.direction === 'sent' ? '-' : '+'}₹{t.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
