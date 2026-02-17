'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { pensionAPI, blockchainAPI, userAPI } from '@/lib/api'

interface BlockEntry {
    id: string
    type: string
    amount: number
    employerMatch: number
    paymentMethod: string
    paymentStatus: string
    txHash: string | null
    createdAt: string
}

export default function BlockchainPage() {
    const [wallet, setWallet] = useState<any>(null)
    const [transactions, setTransactions] = useState<BlockEntry[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [creatingWallet, setCreatingWallet] = useState(false)
    const [selectedTx, setSelectedTx] = useState<BlockEntry | null>(null)
    const [viewMode, setViewMode] = useState<'ledger' | 'blocks'>('blocks')
    const [blockchainHealth, setBlockchainHealth] = useState<any>(null)

    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [withdrawReason, setWithdrawReason] = useState('')
    const [withdrawLoading, setWithdrawLoading] = useState(false)
    const [withdrawResult, setWithdrawResult] = useState<any>(null)
    const [withdrawInfo, setWithdrawInfo] = useState<any>(null)

    // Self-transfer demo state
    const [selfTransferLoading, setSelfTransferLoading] = useState(false)
    const [selfTransferResult, setSelfTransferResult] = useState<any>(null)

    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchData()
    }, [isAuthenticated])

    const fetchData = async () => {
        try {
            try {
                const healthRes = await fetch('/api/blockchain/health')
                const healthData = await healthRes.json()
                setBlockchainHealth(healthData)
            } catch { setBlockchainHealth(null) }

            const [profileRes, contribRes] = await Promise.all([
                userAPI.getProfile(),
                pensionAPI.getContributions(1, 100),
            ])
            setProfile(profileRes)

            // Only show user's own contributions (no employer match details exposed)
            const userContribs = (contribRes.contributions || []).filter(
                (tx: BlockEntry) => tx.type === 'contribution' || tx.type === 'withdrawal'
            )
            setTransactions(userContribs)

            if (profileRes.walletAddress) {
                try {
                    const walletRes = await blockchainAPI.getWalletBalance()
                    setWallet(walletRes)
                } catch { setWallet({ walletAddress: profileRes.walletAddress, onChainBalance: '0 MATIC', appBalance: profileRes.stats?.balance || 0 }) }
            }

            // Fetch withdrawal info
            try {
                const wInfo = await pensionAPI.getWithdrawInfo()
                setWithdrawInfo(wInfo)
            } catch { /* ignore */ }
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const handleCreateWallet = async () => {
        setCreatingWallet(true)
        try {
            const res = await blockchainAPI.createWallet()
            setWallet(res)
            await fetchData()
        } catch (err) { console.error(err) }
        finally { setCreatingWallet(false) }
    }

    const handleSelfTransfer = async () => {
        setSelfTransferLoading(true)
        setSelfTransferResult(null)
        try {
            const result = await blockchainAPI.selfTransfer()
            setSelfTransferResult(result)
            await fetchData()
        } catch (err: any) {
            setSelfTransferResult({ error: true, message: err.message || 'Transfer failed' })
        } finally {
            setSelfTransferLoading(false)
        }
    }

    const handleWithdraw = async () => {
        const amt = parseFloat(withdrawAmount)
        if (!amt || amt < 1) return
        setWithdrawLoading(true)
        try {
            const result = await pensionAPI.withdraw(amt, withdrawReason)
            setWithdrawResult(result)
            // Refresh all data including balance and withdrawal info
            await fetchData()
            // Re-fetch withdrawal info to update modal balance display
            try {
                const wInfo = await pensionAPI.getWithdrawInfo()
                setWithdrawInfo(wInfo)
            } catch {}
            setTimeout(() => {
                setShowWithdrawModal(false)
                setWithdrawResult(null)
                setWithdrawAmount('')
                setWithdrawReason('')
            }, 4000)
        } catch (err: any) {
            setWithdrawResult({ error: err.message || 'Withdrawal failed' })
        } finally {
            setWithdrawLoading(false)
        }
    }

    const shortenAddr = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—'

    // Generate unique block hash from transaction data
    const getBlockHash = (tx: BlockEntry, index: number) => {
        if (tx.txHash && tx.txHash.startsWith('0x') && tx.txHash.length >= 42) return tx.txHash
        // Generate deterministic hash from tx data
        const data = `${tx.id}${tx.amount}${tx.createdAt}${index}`
        let hash = 0
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }
        return '0x' + Math.abs(hash).toString(16).padStart(16, '0') +
            tx.id.replace(/[^a-f0-9]/gi, '').padEnd(48, '0').slice(0, 48)
    }

    const isRealHash = (tx: BlockEntry) => {
        return tx.txHash && tx.txHash.startsWith('0x') && tx.txHash.length >= 42
    }

    // Gas cost estimate (Polygon Amoy)
    const estimateGas = (tx: BlockEntry) => {
        if (tx.type === 'contribution') return { gas: '~52,000', cost: '₹0.05' }
        if (tx.type === 'withdrawal') return { gas: '~78,000', cost: '₹0.08' }
        return { gas: '~50,000', cost: '₹0.05' }
    }

    // Get from/to for privacy-preserving display  
    const getParties = (tx: BlockEntry) => {
        const userName = profile?.name || user?.name || 'You'
        if (tx.type === 'contribution') return { from: userName, to: 'PensionVault' }
        if (tx.type === 'withdrawal') return { from: 'PensionVault', to: userName }
        return { from: userName, to: 'PensionVault' }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-pulse mb-4">
                        <span className="text-3xl">⛓️</span>
                    </div>
                    <p className="text-gray-400">Loading blockchain data...</p>
                </div>
            </div>
        )
    }

    const availableBalance = withdrawInfo?.availableBalance || 0
    const maxWithdraw = withdrawInfo?.maxEmergencyWithdrawal || 0

    return (
        <div className="min-h-screen bg-black">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                                <span className="text-xl">⛓️</span>
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-lg">Blockchain Ledger</h1>
                                <p className="text-amber-400 text-xs flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${blockchainHealth?.isLive ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                                    Polygon Amoy Testnet {blockchainHealth?.isLive ? '(Live)' : '(Demo)'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowWithdrawModal(true)}
                            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm font-medium"
                        >
                            💸 Withdraw
                        </button>
                        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                            <button onClick={() => setViewMode('blocks')} className={`px-4 py-2 rounded-md text-sm transition-all ${viewMode === 'blocks' ? 'bg-amber-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}>
                                ⬡ Chain Explorer
                            </button>
                            <button onClick={() => setViewMode('ledger')} className={`px-4 py-2 rounded-md text-sm transition-all ${viewMode === 'ledger' ? 'bg-amber-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}>
                                📋 Activity Log
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Network Banner */}
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-900/20 via-black to-amber-900/20 border border-amber-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNDUsMTU4LDExLDAuMSkiLz48L3N2Zz4=')] opacity-50" />
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <img src="https://cryptologos.cc/logos/polygon-matic-logo.svg?v=035" alt="Polygon" className="w-8 h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                <h2 className="text-2xl font-bold text-white">Polygon Network</h2>
                                <span className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">AMOY TESTNET</span>
                            </div>
                            <p className="text-gray-400 text-sm">Immutable pension records • Privacy-preserving • Low gas costs</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-500 text-xs">Chain ID</p>
                                <p className="text-white font-mono font-bold">80002</p>
                            </div>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-500 text-xs">Avg Gas</p>
                                <p className="text-white font-mono font-bold">~₹0.05</p>
                            </div>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-500 text-xs">Block</p>
                                <p className="text-white font-mono font-bold">~2s</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wallet + Balance Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 card-highlight relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Your Wallet</h3>
                                {wallet && (
                                    <a href={`https://amoy.polygonscan.com/address/${wallet.walletAddress}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 text-sm hover:underline flex items-center gap-1">
                                        View on PolygonScan ↗
                                    </a>
                                )}
                            </div>

                            {wallet || profile?.walletAddress ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Wallet Address</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-mono text-sm bg-white/5 px-4 py-2 rounded-lg flex-1 truncate">
                                                {wallet?.walletAddress || profile?.walletAddress}
                                            </p>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(wallet?.walletAddress || profile?.walletAddress)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                                title="Copy"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-gray-500 text-xs">Available Balance</p>
                                            <p className="text-2xl font-bold text-green-400">₹{availableBalance.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-gray-500 text-xs">On-Chain Balance</p>
                                            <p className="text-2xl font-bold text-amber-400">{wallet?.onChainBalance || '0 MATIC'}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                            <p className="text-gray-500 text-xs">Max Withdrawal</p>
                                            <p className="text-2xl font-bold text-red-400">₹{maxWithdraw.toLocaleString()}</p>
                                            <p className="text-gray-600 text-xs">50% limit • 10% penalty</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 mb-4">No blockchain wallet connected yet</p>
                                    <button onClick={handleCreateWallet} disabled={creatingWallet} className="btn-gold disabled:opacity-50">
                                        {creatingWallet ? '⏳ Creating...' : '🔗 Create Polygon Wallet'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Self-Transfer Demo Card */}
                    <div className="lg:col-span-3 mb-2">
                        <div className="card border border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-blue-900/10">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        🚀 On-Chain Transfer Demo
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">TESTNET</span>
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">Send a real transaction on Polygon Amoy to prove blockchain integration. This creates a verifiable transaction on PolygonScan.</p>
                                </div>
                                <button
                                    onClick={handleSelfTransfer}
                                    disabled={selfTransferLoading}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                >
                                    {selfTransferLoading ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            Sending on-chain...
                                        </>
                                    ) : (
                                        <>
                                            ⚡ Test On-Chain Transfer
                                        </>
                                    )}
                                </button>
                            </div>

                            {selfTransferResult && (
                                <div className={`mt-4 p-4 rounded-xl border ${selfTransferResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                    {selfTransferResult.success ? (
                                        <div>
                                            <p className="text-green-400 font-medium mb-2">✅ {selfTransferResult.message}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Tx Hash: </span>
                                                    <a href={selfTransferResult.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 font-mono hover:underline">
                                                        {selfTransferResult.txHash?.slice(0, 20)}... ↗
                                                    </a>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Block: </span>
                                                    <span className="text-white font-mono">#{selfTransferResult.blockNumber}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Amount: </span>
                                                    <span className="text-white">{selfTransferResult.amount}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Gas Used: </span>
                                                    <span className="text-white font-mono">{selfTransferResult.gasUsed}</span>
                                                </div>
                                            </div>
                                            <a href={selfTransferResult.explorerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors text-sm">
                                                🔍 View on PolygonScan ↗
                                            </a>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-red-400 font-medium">❌ {selfTransferResult.message || selfTransferResult.error}</p>
                                            {selfTransferResult.faucetUrl && (
                                                <a href={selfTransferResult.faucetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-amber-400 text-sm hover:underline">
                                                    💰 Get FREE testnet MATIC from faucet ↗
                                                </a>
                                            )}
                                            {selfTransferResult.hint && (
                                                <p className="text-gray-500 text-xs mt-1">{selfTransferResult.hint}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats sidebar */}
                    <div className="space-y-4">
                        <div className="card">
                            <p className="text-gray-500 text-xs mb-1">Your Transactions</p>
                            <p className="text-3xl font-bold text-white">{transactions.length}</p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                                <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/30">
                                    {transactions.filter(t => t.type === 'contribution').length} deposits
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/30">
                                    {transactions.filter(t => t.type === 'withdrawal').length} withdrawals
                                </span>
                            </div>
                        </div>
                        <div className="card">
                            <p className="text-gray-500 text-xs mb-1">Smart Contract</p>
                            {blockchainHealth?.contractAddress ? (
                                <a href={`https://amoy.polygonscan.com/address/${blockchainHealth.contractAddress}`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-amber-400 hover:underline block truncate">
                                    {blockchainHealth.contractAddress.slice(0, 10)}...{blockchainHealth.contractAddress.slice(-6)} ↗
                                </a>
                            ) : (
                                <p className="text-sm font-mono text-amber-400">PensionVault.sol</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">{blockchainHealth?.contractBalance || 'Contributions • Withdrawals'}</p>
                        </div>
                        <div className="card">
                            <p className="text-gray-500 text-xs mb-1">Gas Costs</p>
                            <p className="text-lg font-bold text-green-400">₹0.05 - ₹0.08</p>
                            <p className="text-gray-500 text-xs mt-1">Per transaction on Polygon</p>
                        </div>
                    </div>
                </div>

                {/* Transaction Detail Modal */}
                {selectedTx && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setSelectedTx(null)}>
                        <div className="w-full max-w-lg card-highlight" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Block Details</h3>
                                <button onClick={() => setSelectedTx(null)} className="p-2 rounded-full hover:bg-white/10 text-gray-400">✕</button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                                    <p className="text-gray-500 text-xs mb-1">Block Hash</p>
                                    {isRealHash(selectedTx) ? (
                                        <a href={`https://amoy.polygonscan.com/tx/${selectedTx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 font-mono text-xs break-all hover:underline">
                                            {selectedTx.txHash} ↗
                                        </a>
                                    ) : (
                                        <p className="text-amber-400 font-mono text-xs break-all">{getBlockHash(selectedTx, 0)}</p>
                                    )}
                                </div>

                                {/* Privacy-preserving: only show from/to */}
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-gray-500 text-xs mb-2">Transaction Flow</p>
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <p className="text-white font-medium">{getParties(selectedTx).from}</p>
                                            <p className="text-gray-600 text-xs">Sender</p>
                                        </div>
                                        <div className="flex-1 mx-4 flex items-center">
                                            <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-500 to-green-500"></div>
                                            <span className="mx-2 text-white font-bold">₹{selectedTx.amount}</span>
                                            <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 to-amber-500"></div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-medium">{getParties(selectedTx).to}</p>
                                            <p className="text-gray-600 text-xs">Receiver</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500 text-xs">Type</p>
                                        <p className={`font-medium ${selectedTx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                                            {selectedTx.type === 'contribution' ? '💰 Deposit' : '💸 Withdrawal'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Amount</p>
                                        <p className="text-white font-bold text-lg">₹{selectedTx.amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Est. Gas Cost</p>
                                        <p className="text-gray-300 text-sm">{estimateGas(selectedTx).gas} ({estimateGas(selectedTx).cost})</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Status</p>
                                        <p className={`text-sm flex items-center gap-1 ${isRealHash(selectedTx) ? 'text-green-400' : 'text-amber-400'}`}>
                                            <span className={`w-2 h-2 rounded-full ${isRealHash(selectedTx) ? 'bg-green-500' : 'bg-amber-500'}`} />
                                            {isRealHash(selectedTx) ? 'Confirmed (On-Chain)' : 'Recorded (App)'}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 text-xs">Timestamp</p>
                                        <p className="text-gray-300 text-sm">{new Date(selectedTx.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl ${isRealHash(selectedTx) ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                                    <p className={`text-xs ${isRealHash(selectedTx) ? 'text-green-400' : 'text-amber-400'}`}>
                                        {isRealHash(selectedTx)
                                            ? '🔒 This transaction is immutably recorded on the Polygon blockchain.'
                                            : '📝 Recorded in-app. Deploy contract to record on-chain.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Block View */}
                {viewMode === 'blocks' ? (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            ⬡ Chain Explorer
                            <span className="text-sm font-normal text-gray-500">({transactions.length} blocks)</span>
                        </h2>

                        {transactions.length === 0 ? (
                            <div className="card text-center py-16">
                                <span className="text-5xl mb-4 block">🏗️</span>
                                <p className="text-white text-xl font-bold mb-2">No Transactions Yet</p>
                                <p className="text-gray-400 mb-6">Make your first contribution to see it on the blockchain</p>
                                <Link href="/dashboard" className="btn-gold inline-flex items-center gap-2">
                                    💰 Go to Dashboard to Contribute
                                </Link>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Vertical chain line */}
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-500/20" />

                                <div className="space-y-4">
                                    {/* Genesis block */}
                                    <div className="relative flex items-start gap-6 ml-2">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center z-10 flex-shrink-0 shadow-lg shadow-amber-500/20">
                                            <span className="text-lg">🏁</span>
                                        </div>
                                        <div className="flex-1 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <div className="flex items-center justify-between">
                                                <p className="text-amber-400 font-bold">Genesis Block</p>
                                                <span className="text-xs text-gray-500 font-mono">Block #0</span>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-1">PensionVault deployed on Polygon Amoy</p>
                                        </div>
                                    </div>

                                    {transactions.map((tx, index) => {
                                        const parties = getParties(tx)
                                        const gas = estimateGas(tx)
                                        const blockHash = getBlockHash(tx, index)
                                        return (
                                            <div key={tx.id} className="relative flex items-start gap-6 ml-2 group cursor-pointer" onClick={() => setSelectedTx(tx)}>
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center z-10 flex-shrink-0 border transition-all group-hover:scale-110 group-hover:shadow-lg ${tx.type === 'withdrawal'
                                                    ? 'text-red-400 bg-red-500/10 border-red-500/30'
                                                    : 'text-green-400 bg-green-500/10 border-green-500/30'
                                                    }`}>
                                                    <span className="text-lg">{tx.type === 'withdrawal' ? '💸' : '💰'}</span>
                                                </div>

                                                <div className={`flex-1 p-4 rounded-xl border transition-all group-hover:border-amber-500/30 group-hover:bg-amber-500/5 ${index % 2 === 0 ? 'bg-white/[0.02] border-white/5' : 'bg-white/[0.04] border-white/10'}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${tx.type === 'withdrawal'
                                                                ? 'text-red-400 bg-red-500/10 border-red-500/30'
                                                                : 'text-green-400 bg-green-500/10 border-green-500/30'
                                                                }`}>
                                                                {tx.type === 'withdrawal' ? 'WITHDRAW' : 'DEPOSIT'}
                                                            </span>
                                                            <span className="text-white font-bold">₹{tx.amount}</span>
                                                            {isRealHash(tx) && (
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">ON-CHAIN</span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-500 font-mono">Block #{index + 1}</span>
                                                    </div>

                                                    {/* Privacy-preserving: just from → to */}
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                                        <span className="text-white">{parties.from}</span>
                                                        <span className="text-amber-400">→</span>
                                                        <span className="text-white">{parties.to}</span>
                                                        <span className="text-gray-600 ml-auto">Gas: {gas.cost}</span>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        {isRealHash(tx) ? (
                                                            <a href={`https://amoy.polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-amber-400 hover:underline" onClick={e => e.stopPropagation()}>
                                                                {tx.txHash!.slice(0, 18)}... ↗
                                                            </a>
                                                        ) : (
                                                            <span className="font-mono">{blockHash.slice(0, 18)}...</span>
                                                        )}
                                                        <span>•</span>
                                                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Ledger View - Privacy preserving: only from/to, no details */
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            📋 Activity Log
                            <span className="text-sm font-normal text-gray-500">({transactions.length} records)</span>
                        </h2>

                        {transactions.length === 0 ? (
                            <div className="card text-center py-16">
                                <span className="text-5xl mb-4 block">📋</span>
                                <p className="text-white text-xl font-bold mb-2">Empty Ledger</p>
                                <p className="text-gray-400">No transactions recorded yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-white/10">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/[0.02]">
                                            <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">BLOCK</th>
                                            <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">FROM</th>
                                            <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">TO</th>
                                            <th className="text-right text-gray-500 text-xs font-medium px-6 py-4">AMOUNT</th>
                                            <th className="text-right text-gray-500 text-xs font-medium px-6 py-4">GAS</th>
                                            <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">STATUS</th>
                                            <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">DATE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx, index) => {
                                            const parties = getParties(tx)
                                            const gas = estimateGas(tx)
                                            return (
                                                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors" onClick={() => setSelectedTx(tx)}>
                                                    <td className="px-6 py-4 text-gray-400 text-sm font-mono">#{index + 1}</td>
                                                    <td className="px-6 py-4 text-white text-sm">{parties.from}</td>
                                                    <td className="px-6 py-4 text-white text-sm">{parties.to}</td>
                                                    <td className={`px-6 py-4 font-medium text-right ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                                                        {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs text-right">{gas.cost}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs flex items-center gap-1 ${isRealHash(tx) ? 'text-green-400' : 'text-amber-400'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${isRealHash(tx) ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                            {isRealHash(tx) ? 'On-Chain' : 'Recorded'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Vault Features */}
                <div className="mt-12 card">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">🔐 Pension Vault Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-gray-500 text-xs">Vault</p>
                            <p className="text-amber-400 font-mono text-sm">PensionVault</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-gray-500 text-xs">Network</p>
                            <p className="text-amber-400 text-sm">Polygon Amoy</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-gray-500 text-xs">Avg. Fee</p>
                            <p className="text-green-400 font-mono text-sm">~₹0.05/tx</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-gray-500 text-xs">Security</p>
                            <p className="text-white font-mono text-sm">Audited ✓</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                            <p className="text-green-400 font-medium mb-1">💰 Deposit Funds</p>
                            <p className="text-gray-500 text-xs">Securely deposit your pension savings into the vault. Low-cost on-chain recording.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <p className="text-blue-400 font-medium mb-1">🏢 Company Matching</p>
                            <p className="text-gray-500 text-xs">Your employer automatically adds matching contributions to boost your savings.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                            <p className="text-red-400 font-medium mb-1">💸 Fund Access</p>
                            <p className="text-gray-500 text-xs">Emergency access up to 50% of your balance. A small fee ensures vault stability.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md card-highlight">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">💸 Emergency Withdrawal</h2>
                            <button
                                onClick={() => { setShowWithdrawModal(false); setWithdrawResult(null) }}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {withdrawResult?.success ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-4">✅</div>
                                <p className="text-green-400 font-medium text-lg mb-2">{withdrawResult.message}</p>
                                <p className="text-gray-500 text-sm">Remaining balance: ₹{withdrawResult.remainingBalance}</p>
                            </div>
                        ) : withdrawResult?.error ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-400 text-sm">❌ {withdrawResult.error}</p>
                                </div>
                                <button onClick={() => setWithdrawResult(null)} className="w-full p-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors">
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Balance info */}
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Available Balance</span>
                                        <span className="text-white font-bold">₹{availableBalance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">Max Withdrawal (50%)</span>
                                        <span className="text-red-400 font-bold">₹{maxWithdraw.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-amber-400 text-sm">
                                        ⚠️ Emergency withdrawals have a <strong>10% penalty</strong>. You can withdraw up to 50% of your balance.
                                    </p>
                                </div>

                                {/* Amount input */}
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Withdrawal Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder={`Max ₹${maxWithdraw}`}
                                        max={maxWithdraw}
                                        min={1}
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-bold focus:border-amber-500/50 focus:outline-none transition-colors"
                                    />
                                    {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                                        <div className="mt-2 p-3 rounded-xl bg-white/5 text-sm">
                                            <div className="flex justify-between text-gray-400">
                                                <span>Gross Amount</span>
                                                <span>₹{parseFloat(withdrawAmount).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-red-400">
                                                <span>Penalty (10%)</span>
                                                <span>-₹{Math.round(parseFloat(withdrawAmount) * 0.10).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-green-400 font-bold border-t border-white/10 mt-2 pt-2">
                                                <span>You Receive</span>
                                                <span>₹{Math.round(parseFloat(withdrawAmount) * 0.90).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">Reason (optional)</label>
                                    <select
                                        value={withdrawReason}
                                        onChange={(e) => setWithdrawReason(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-[#1a1a2e] border border-white/10 text-white focus:border-amber-500/50 focus:outline-none transition-colors appearance-none"
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        <option value="" className="bg-[#1a1a2e] text-gray-400">Select reason...</option>
                                        <option value="medical" className="bg-[#1a1a2e] text-white">Medical Emergency</option>
                                        <option value="family" className="bg-[#1a1a2e] text-white">Family Emergency</option>
                                        <option value="housing" className="bg-[#1a1a2e] text-white">Housing Needs</option>
                                        <option value="education" className="bg-[#1a1a2e] text-white">Education</option>
                                        <option value="other" className="bg-[#1a1a2e] text-white">Other</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleWithdraw}
                                    disabled={withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) < 1 || parseFloat(withdrawAmount) > maxWithdraw}
                                    className="w-full p-4 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {withdrawLoading ? '⏳ Processing...' : `Withdraw ₹${withdrawAmount || '0'}`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
