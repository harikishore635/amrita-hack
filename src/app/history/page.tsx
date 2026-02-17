'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface OtherParty {
    id: string
    name: string
    email: string
}

interface Transaction {
    id: string
    type: string
    amount: number
    employerMatch: number
    paymentMethod: string
    txHash: string | null
    createdAt: string
    otherParty?: OtherParty | null
}

interface EmployerGroup {
    employerId: string | null
    employerName: string
    matchPercentage: number
    isCurrent: boolean
    transactions: Transaction[]
    totalContributed: number
    totalMatched: number
    totalYields: number
    totalWithdrawn: number
    totalTransfersIn: number
    totalTransfersOut: number
    netBalance: number
    txCount: number
    firstDate: string
    lastDate: string
}

export default function HistoryPage() {
    const [employers, setEmployers] = useState<EmployerGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedEmployer, setExpandedEmployer] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<string>('all')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    const fetchHistory = useCallback(async () => {
        try {
            const token = localStorage.getItem('pensionchain_access_token')
            if (!token) return
            const res = await fetch('/api/pension/history', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setEmployers(data.employers || [])
            setLastUpdated(new Date())
            // Auto-expand the current employer
            const current = data.employers?.find((e: EmployerGroup) => e.isCurrent)
            if (current && !expandedEmployer) {
                setExpandedEmployer(current.employerId || '_none')
            }
        } catch (err) {
            console.error('Failed to fetch history:', err)
        } finally {
            setLoading(false)
        }
    }, [expandedEmployer])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchHistory()
        // Auto-refresh every 10 seconds for dynamic updates
        const interval = setInterval(fetchHistory, 10000)
        return () => clearInterval(interval)
    }, [isAuthenticated, fetchHistory])

    const toggleExpand = (id: string | null) => {
        const key = id || '_none'
        setExpandedEmployer(prev => prev === key ? null : key)
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'contribution': return '💰'
            case 'match': return '🏢'
            case 'yield': return '📈'
            case 'withdrawal': return '💸'
            case 'transfer_in': return '↙️'
            case 'transfer_out': return '↗️'
            default: return '📄'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'contribution': return 'text-green-400'
            case 'match': return 'text-blue-400'
            case 'yield': return 'text-purple-400'
            case 'withdrawal': return 'text-red-400'
            case 'transfer_in': return 'text-emerald-400'
            case 'transfer_out': return 'text-orange-400'
            default: return 'text-gray-400'
        }
    }

    const getTypeLabel = (type: string, tx?: Transaction) => {
        switch (type) {
            case 'contribution': return 'Deposit'
            case 'match': return 'Company Match'
            case 'yield': return 'DeFi Yield'
            case 'withdrawal': return 'Withdrawal'
            case 'transfer_in': return tx?.otherParty ? `Received from ${tx.otherParty.name}` : 'Received'
            case 'transfer_out': return tx?.otherParty ? `Sent to ${tx.otherParty.name}` : 'Sent'
            default: return type
        }
    }

    const isDebit = (type: string) => ['withdrawal', 'transfer_out'].includes(type)

    const allTypes = ['all', 'contribution', 'match', 'yield', 'withdrawal', 'transfer_in', 'transfer_out']
    const typeLabels: Record<string, string> = {
        all: 'All',
        contribution: 'Deposits',
        match: 'Matches',
        yield: 'Yields',
        withdrawal: 'Withdrawals',
        transfer_in: 'Received',
        transfer_out: 'Sent',
    }

    const filterTransactions = (txs: Transaction[]) => {
        if (filterType === 'all') return txs
        return txs.filter(t => t.type === filterType)
    }

    const totalBalance = employers.reduce((s, e) => s + e.netBalance, 0)
    const totalTxns = employers.reduce((s, e) => s + e.txCount, 0)
    const totalTransfersIn = employers.reduce((s, e) => s + e.totalTransfersIn, 0)
    const totalTransfersOut = employers.reduce((s, e) => s + e.totalTransfersOut, 0)

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-pulse mb-4">
                        <span className="text-black font-bold text-2xl">P</span>
                    </div>
                    <p className="text-gray-400">Loading transaction history...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                                <span className="text-xl">📜</span>
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-lg">Transaction History</h1>
                                <p className="text-gray-500 text-xs">
                                    Grouped by employer • {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setLoading(true); fetchHistory() }}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                            title="Refresh"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="card">
                        <p className="text-gray-500 text-xs mb-1">Net Balance</p>
                        <p className="text-2xl font-bold text-white">₹{totalBalance.toLocaleString()}</p>
                        <p className="text-gray-600 text-xs mt-1">Across all employers</p>
                    </div>
                    <div className="card">
                        <p className="text-gray-500 text-xs mb-1">Transactions</p>
                        <p className="text-2xl font-bold text-white">{totalTxns}</p>
                        <p className="text-gray-600 text-xs mt-1">All time</p>
                    </div>
                    <div className="card">
                        <p className="text-gray-500 text-xs mb-1">Transfers In</p>
                        <p className="text-2xl font-bold text-emerald-400">+₹{totalTransfersIn.toLocaleString()}</p>
                        <p className="text-gray-600 text-xs mt-1">Received</p>
                    </div>
                    <div className="card">
                        <p className="text-gray-500 text-xs mb-1">Transfers Out</p>
                        <p className="text-2xl font-bold text-orange-400">-₹{totalTransfersOut.toLocaleString()}</p>
                        <p className="text-gray-600 text-xs mt-1">Sent</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {allTypes.map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                filterType === t
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {typeLabels[t]}
                        </button>
                    ))}
                </div>

                {/* Employer Groups */}
                {employers.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-gray-400 text-lg">No transactions yet</p>
                        <p className="text-gray-600 text-sm mt-2">Make your first contribution from the dashboard</p>
                        <Link href="/dashboard" className="inline-block mt-4 btn-gold">
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {employers.map((emp) => {
                            const key = emp.employerId || '_none'
                            const isExpanded = expandedEmployer === key
                            const filteredTxs = filterTransactions(emp.transactions)
                            // Skip employer group if filter yields no results
                            if (filterType !== 'all' && filteredTxs.length === 0) return null

                            return (
                                <div key={key} className={`card border ${emp.isCurrent ? 'border-amber-500/30' : 'border-white/5'} transition-all`}>
                                    {/* Employer Header — clickable */}
                                    <button
                                        onClick={() => toggleExpand(emp.employerId)}
                                        className="w-full text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${emp.isCurrent ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                                                    🏢
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-white font-bold">{emp.employerName}</h3>
                                                        {emp.isCurrent && (
                                                            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">Current</span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-500 text-sm">
                                                        {new Date(emp.firstDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                                        {' — '}
                                                        {emp.isCurrent ? 'Present' : new Date(emp.lastDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                                        {' · '}{filterType === 'all' ? emp.txCount : filteredTxs.length} transactions
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-white font-bold">₹{emp.netBalance.toLocaleString()}</p>
                                                    <p className="text-gray-600 text-xs">
                                                        {emp.matchPercentage > 0 ? `${emp.matchPercentage}% match` : 'No match'}
                                                    </p>
                                                </div>
                                                <svg className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Mobile balance */}
                                        <div className="md:hidden mt-3 flex items-center gap-4">
                                            <span className="text-white font-bold">₹{emp.netBalance.toLocaleString()}</span>
                                            {emp.matchPercentage > 0 && (
                                                <span className="text-gray-600 text-xs">{emp.matchPercentage}% match</span>
                                            )}
                                        </div>

                                        {/* Mini stats row */}
                                        <div className="flex gap-2 mt-3 flex-wrap">
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                                                💰 ₹{emp.totalContributed.toLocaleString()} deposited
                                            </span>
                                            {emp.totalMatched > 0 && (
                                                <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    🏢 ₹{emp.totalMatched.toLocaleString()} matched
                                                </span>
                                            )}
                                            {emp.totalYields > 0 && (
                                                <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    📈 ₹{emp.totalYields.toLocaleString()} yield
                                                </span>
                                            )}
                                            {emp.totalTransfersIn > 0 && (
                                                <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    ↙️ ₹{emp.totalTransfersIn.toLocaleString()} received
                                                </span>
                                            )}
                                            {emp.totalTransfersOut > 0 && (
                                                <span className="px-2 py-1 rounded-full text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                    ↗️ ₹{emp.totalTransfersOut.toLocaleString()} sent
                                                </span>
                                            )}
                                            {emp.totalWithdrawn > 0 && (
                                                <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">
                                                    💸 ₹{emp.totalWithdrawn.toLocaleString()} withdrawn
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded: Transaction list */}
                                    {isExpanded && (
                                        <div className="mt-4 border-t border-white/5 pt-4">
                                            {filteredTxs.length === 0 ? (
                                                <p className="text-gray-500 text-sm text-center py-4">No {typeLabels[filterType]?.toLowerCase()} transactions</p>
                                            ) : (
                                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                                                    {filteredTxs.map((tx) => (
                                                        <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-lg">{getTypeIcon(tx.type)}</span>
                                                                <div>
                                                                    <p className={`text-sm font-medium ${getTypeColor(tx.type)}`}>
                                                                        {getTypeLabel(tx.type, tx)}
                                                                    </p>
                                                                    <p className="text-gray-600 text-xs">
                                                                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                                                            day: 'numeric', month: 'short', year: 'numeric',
                                                                            hour: '2-digit', minute: '2-digit'
                                                                        })}
                                                                        {tx.paymentMethod && ` · ${tx.paymentMethod.toUpperCase()}`}
                                                                    </p>
                                                                    {tx.otherParty && (
                                                                        <p className="text-gray-500 text-xs mt-0.5">
                                                                            {tx.otherParty.email}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={`font-mono font-bold text-sm ${isDebit(tx.type) ? 'text-red-400' : 'text-green-400'}`}>
                                                                    {isDebit(tx.type) ? '-' : '+'}₹{tx.amount.toLocaleString()}
                                                                </p>
                                                                {tx.txHash && (
                                                                    <p className="text-amber-400/60 text-xs font-mono mt-0.5 truncate max-w-[120px]">
                                                                        {tx.txHash.startsWith('0x') ? (
                                                                            <a
                                                                                href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="hover:underline hover:text-amber-400"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                {tx.txHash.slice(0, 10)}... ↗
                                                                            </a>
                                                                        ) : (
                                                                            <span>{tx.txHash.slice(0, 14)}...</span>
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
