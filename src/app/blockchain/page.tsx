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

    const { isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchData()
    }, [isAuthenticated])

    const fetchData = async () => {
        try {
            // Fetch blockchain health status
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
            setTransactions(contribRes.contributions || [])

            if (profileRes.walletAddress) {
                try {
                    const walletRes = await blockchainAPI.getWalletBalance()
                    setWallet(walletRes)
                } catch { setWallet({ walletAddress: profileRes.walletAddress, onChainBalance: '0 MATIC', appBalance: profileRes.stats?.balance || 0 }) }
            }
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

    const shortenHash = (hash: string) => hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : '—'
    const shortenAddr = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—'

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'contribution': return 'text-green-400 bg-green-500/10 border-green-500/30'
            case 'match': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
            case 'yield': return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
            case 'withdrawal': return 'text-red-400 bg-red-500/10 border-red-500/30'
            default: return 'text-gray-400 bg-white/5 border-white/10'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) { case 'contribution': return '💰'; case 'match': return '🏢'; case 'yield': return '📈'; case 'withdrawal': return '💸'; default: return '🔗' }
    }

    const getDisplayHash = (tx: BlockEntry) => {
        // Use real txHash if available (starts with 0x and is a proper hash)
        if (tx.txHash && tx.txHash.startsWith('0x') && tx.txHash.length >= 42) {
            return tx.txHash
        }
        // Fallback: generate a simulated hash for display
        const base = tx.txHash || tx.id
        return '0x' + Array.from(base).map((c, i) => ((c.charCodeAt(0) * (i + 7)) % 256).toString(16).padStart(2, '0')).join('').slice(0, 64)
    }

    const isRealHash = (tx: BlockEntry) => {
        return tx.txHash && tx.txHash.startsWith('0x') && tx.txHash.length >= 42
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
                                    Polygon Amoy Testnet {blockchainHealth?.isLive ? '(Live)' : '(Simulated)'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                            <button onClick={() => setViewMode('blocks')} className={`px-4 py-2 rounded-md text-sm transition-all ${viewMode === 'blocks' ? 'bg-amber-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}>
                                ⬡ Blocks
                            </button>
                            <button onClick={() => setViewMode('ledger')} className={`px-4 py-2 rounded-md text-sm transition-all ${viewMode === 'ledger' ? 'bg-amber-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}>
                                📋 Ledger
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
                            <p className="text-gray-400 text-sm">All pension transactions are recorded on the Polygon blockchain for transparency and immutability</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-500 text-xs">Chain ID</p>
                                <p className="text-white font-mono font-bold">80002</p>
                            </div>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-500 text-xs">Block Time</p>
                                <p className="text-white font-mono font-bold">~2s</p>
                            </div>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-500 text-xs">Gas</p>
                                <p className="text-white font-mono font-bold">Low</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wallet Card */}
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-gray-500 text-xs">On-Chain Balance</p>
                                            <p className="text-2xl font-bold text-amber-400">{wallet?.onChainBalance || '0 MATIC'}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-gray-500 text-xs">App Balance</p>
                                            <p className="text-2xl font-bold text-green-400">₹{(wallet?.appBalance || profile?.stats?.balance || 0).toLocaleString()}</p>
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

                    {/* Stats sidebar */}
                    <div className="space-y-4">
                        <div className="card">
                            <p className="text-gray-500 text-xs mb-1">Total Transactions</p>
                            <p className="text-3xl font-bold text-white">{transactions.length}</p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                                <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/30">
                                    {transactions.filter(t => t.type === 'contribution').length} contributions
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                    {transactions.filter(t => t.type === 'match').length} matches
                                </span>
                            </div>
                        </div>
                        <div className="card">
                            <p className="text-gray-500 text-xs mb-1">Network</p>
                            <p className="text-lg font-bold text-amber-400">Polygon Amoy</p>
                            <p className="text-gray-500 text-xs mt-1">EVM Compatible · Low Gas</p>
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
                            <p className="text-gray-500 text-xs mt-1">{blockchainHealth?.contractBalance || 'Contributions · Matching · Withdrawals'}</p>
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
                                    <p className="text-gray-500 text-xs mb-1">{isRealHash(selectedTx) ? 'Transaction Hash (On-Chain)' : 'Block Hash (Simulated)'}</p>
                                    {isRealHash(selectedTx) ? (
                                        <a href={`https://amoy.polygonscan.com/tx/${selectedTx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 font-mono text-xs break-all hover:underline">
                                            {selectedTx.txHash} ↗
                                        </a>
                                    ) : (
                                        <p className="text-amber-400 font-mono text-xs break-all">{getDisplayHash(selectedTx)}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500 text-xs">Type</p>
                                        <p className={`font-medium ${getTypeColor(selectedTx.type).split(' ')[0]}`}>
                                            {getTypeIcon(selectedTx.type)} {selectedTx.type.charAt(0).toUpperCase() + selectedTx.type.slice(1)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Amount</p>
                                        <p className="text-white font-bold text-lg">₹{selectedTx.amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Method</p>
                                        <p className="text-gray-300 text-sm">{selectedTx.paymentMethod.toUpperCase()}</p>
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
                                    {selectedTx.txHash && !isRealHash(selectedTx) && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500 text-xs">Reference ID</p>
                                            <p className="text-amber-400 font-mono text-xs break-all">{selectedTx.txHash}</p>
                                        </div>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl ${isRealHash(selectedTx) ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                                    <p className={`text-xs ${isRealHash(selectedTx) ? 'text-green-400' : 'text-amber-400'}`}>
                                        {isRealHash(selectedTx)
                                            ? '🔒 This transaction is immutably recorded on the Polygon blockchain. It cannot be altered or deleted.'
                                            : '📝 This transaction is recorded in the app. Deploy the smart contract to record on-chain.'}
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
                            ⬡ Block Chain View
                            <span className="text-sm font-normal text-gray-500">({transactions.length} blocks)</span>
                        </h2>

                        {/* Chain visualization */}
                        <div className="relative">
                            {/* Vertical line */}
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
                                        <p className="text-gray-400 text-sm mt-1">PensionChain contract deployed on Polygon Amoy</p>
                                        <p className="text-gray-600 text-xs font-mono mt-2">0x0000000000000000000000000000000000000000000000000000000000000000</p>
                                    </div>
                                </div>

                                {transactions.slice(0, 30).map((tx, index) => (
                                    <div key={tx.id} className="relative flex items-start gap-6 ml-2 group cursor-pointer" onClick={() => setSelectedTx(tx)}>
                                        {/* Block icon */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center z-10 flex-shrink-0 border transition-all group-hover:scale-110 group-hover:shadow-lg ${getTypeColor(tx.type)}`}>
                                            <span className="text-lg">{getTypeIcon(tx.type)}</span>
                                        </div>

                                        {/* Block content */}
                                        <div className={`flex-1 p-4 rounded-xl border transition-all group-hover:border-amber-500/30 group-hover:bg-amber-500/5 ${index % 2 === 0 ? 'bg-white/[0.02] border-white/5' : 'bg-white/[0.04] border-white/10'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getTypeColor(tx.type)}`}>
                                                        {tx.type.toUpperCase()}
                                                    </span>
                                                    <span className="text-white font-bold">₹{tx.amount}</span>
                                                    {isRealHash(tx) && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">ON-CHAIN</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500 font-mono">Block #{index + 1}</span>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {isRealHash(tx) ? (
                                                    <a href={`https://amoy.polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-amber-400 hover:underline">
                                                        {tx.txHash!.slice(0, 18)}... ↗
                                                    </a>
                                                ) : (
                                                    <span className="font-mono">{getDisplayHash(tx).slice(0, 18)}...</span>
                                                )}
                                                <span>•</span>
                                                <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className={`flex items-center gap-1 ${isRealHash(tx) ? 'text-green-400' : 'text-amber-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isRealHash(tx) ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                    {isRealHash(tx) ? 'Confirmed' : 'Recorded'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {transactions.length > 30 && (
                                    <div className="relative flex items-start gap-6 ml-2">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center z-10 flex-shrink-0 border border-white/10">
                                            <span className="text-lg">📦</span>
                                        </div>
                                        <div className="flex-1 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                            <p className="text-gray-400 text-sm">+ {transactions.length - 30} more blocks</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Ledger Table View */
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            📋 Transaction Ledger
                            <span className="text-sm font-normal text-gray-500">({transactions.length} records)</span>
                        </h2>

                        <div className="overflow-x-auto rounded-2xl border border-white/10">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/[0.02]">
                                        <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">BLOCK</th>
                                        <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">HASH</th>
                                        <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">TYPE</th>
                                        <th className="text-right text-gray-500 text-xs font-medium px-6 py-4">AMOUNT</th>
                                        <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">METHOD</th>
                                        <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">STATUS</th>
                                        <th className="text-left text-gray-500 text-xs font-medium px-6 py-4">TIMESTAMP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0, 50).map((tx, index) => (
                                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors" onClick={() => setSelectedTx(tx)}>
                                            <td className="px-6 py-4 text-gray-400 text-sm font-mono">#{index + 1}</td>
                                            <td className="px-6 py-4 text-xs font-mono">
                                                {isRealHash(tx) ? (
                                                    <a href={`https://amoy.polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                                                        {tx.txHash!.slice(0, 14)}... ↗
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500">{getDisplayHash(tx).slice(0, 14)}...</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(tx.type)}`}>
                                                    {getTypeIcon(tx.type)} {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium text-right">₹{tx.amount}</td>
                                            <td className="px-6 py-4 text-gray-400 text-sm uppercase text-xs">{tx.paymentMethod}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs flex items-center gap-1 ${isRealHash(tx) ? 'text-green-400' : 'text-amber-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isRealHash(tx) ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                    {isRealHash(tx) ? 'Confirmed' : 'Recorded'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Smart Contract Info */}
                <div className="mt-12 card">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">📜 Smart Contract: PensionVault.sol</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-gray-500 text-xs">Contract</p>
                            <p className="text-amber-400 font-mono text-sm">PensionVault</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-gray-500 text-xs">Network</p>
                            <p className="text-amber-400 text-sm">Polygon Amoy</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-gray-500 text-xs">Solidity Version</p>
                            <p className="text-white font-mono text-sm">^0.8.19</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-gray-500 text-xs">License</p>
                            <p className="text-white text-sm">MIT</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                            <p className="text-green-400 font-medium mb-1">💰 contribute()</p>
                            <p className="text-gray-500 text-xs">Worker deposits pension contribution. Auto-creates account on first call.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <p className="text-blue-400 font-medium mb-1">🏢 addEmployerMatch()</p>
                            <p className="text-gray-500 text-xs">Employer adds matching contribution. Only registered employers.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                            <p className="text-red-400 font-medium mb-1">🚨 emergencyWithdraw()</p>
                            <p className="text-gray-500 text-xs">Max 50% with 10% penalty. For urgent needs only.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
