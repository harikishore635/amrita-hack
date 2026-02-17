'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface Transaction {
    id: string
    type: string
    amount: number
    employerMatch: number
    paymentMethod: string
    txHash: string | null
    createdAt: string
}

interface EmployerGroup {
    employerId: string | null
    employerName: string
    matchPercentage: number
    isCurrent: boolean
    transactions: Transaction[]
    totalContributed: number
    totalMatched: number
    totalWithdrawn: number
    netBalance: number
    txCount: number
    firstDate: string
    lastDate: string
}

export default function HistoryPage() {
    const [employers, setEmployers] = useState<EmployerGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedEmployer, setExpandedEmployer] = useState<string | null>(null)
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchHistory()
    }, [isAuthenticated])

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/pension/history', {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            setEmployers(data.employers || [])
            // Auto-expand the current employer
            const current = data.employers?.find((e: EmployerGroup) => e.isCurrent)
            if (current) setExpandedEmployer(current.employerId || '_none')
        } catch (err) {
            console.error('Failed to fetch history:', err)
        } finally {
            setLoading(false)
        }
    }

    const toggleExpand = (id: string | null) => {
        const key = id || '_none'
        setExpandedEmployer(prev => prev === key ? null : key)
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'contribution': return '💰'
            case 'match': return '🏢'
            case 'withdrawal': return '💸'
            default: return '📄'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'contribution': return 'text-green-400'
            case 'match': return 'text-blue-400'
            case 'withdrawal': return 'text-red-400'
            default: return 'text-gray-400'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'contribution': return 'Deposit'
            case 'match': return 'Company Match'
            case 'withdrawal': return 'Withdrawal'
            default: return type
        }
    }

    const totalBalance = employers.reduce((s, e) => s + e.netBalance, 0)
    const totalTxns = employers.reduce((s, e) => s + e.txCount, 0)

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
                                <p className="text-gray-500 text-xs">All transactions grouped by employer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="card">
                        <p className="text-gray-500 text-xs mb-1">Total Balance</p>
                        <p className="text-3xl font-bold text-white">₹{totalBalance.toLocaleString()}</p>
                        <p className="text-gray-600 text-xs mt-1">Across all employers</p>
                    </div>
                    <div className="card">
                        <p className="text-gray-500 text-xs mb-1">Total Transactions</p>
                        <p className="text-3xl font-bold text-white">{totalTxns}</p>
                        <p className="text-gray-600 text-xs mt-1">All time</p>
                    </div>
                    <div className="card">
                        <p className="text-gray-500 text-xs mb-1">Employers</p>
                        <p className="text-3xl font-bold text-white">{employers.length}</p>
                        <p className="text-gray-600 text-xs mt-1">Companies worked with</p>
                    </div>
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
                                                        {' · '}{emp.txCount} transactions
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
                                        <div className="flex gap-4 mt-3 flex-wrap">
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                                                💰 ₹{emp.totalContributed.toLocaleString()} deposited
                                            </span>
                                            {emp.totalMatched > 0 && (
                                                <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    🏢 ₹{emp.totalMatched.toLocaleString()} matched
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
                                            <div className="space-y-2">
                                                {emp.transactions.map((tx) => (
                                                    <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg">{getTypeIcon(tx.type)}</span>
                                                            <div>
                                                                <p className={`text-sm font-medium ${getTypeColor(tx.type)}`}>
                                                                    {getTypeLabel(tx.type)}
                                                                </p>
                                                                <p className="text-gray-600 text-xs">
                                                                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                                        hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                    {tx.paymentMethod && ` · ${tx.paymentMethod.toUpperCase()}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`font-mono font-bold text-sm ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                                                                {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                                                            </p>
                                                            {tx.txHash && (
                                                                <a
                                                                    href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-amber-400 text-xs hover:underline font-mono"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {tx.txHash.slice(0, 10)}... ↗
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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
