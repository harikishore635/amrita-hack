'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { userAPI, pensionAPI, paymentAPI } from '@/lib/api'

export default function Dashboard() {
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState(10)
  const [contributionLoading, setContributionLoading] = useState(false)
  const [contributionSuccess, setContributionSuccess] = useState('')
  const [profileData, setProfileData] = useState<any>(null)
  const [balanceData, setBalanceData] = useState<any>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Switch Job state
  const [showSwitchJobModal, setShowSwitchJobModal] = useState(false)
  const [switchJobStep, setSwitchJobStep] = useState<'qr' | 'scan' | 'done'>('qr')
  const [transferRecord, setTransferRecord] = useState<any>(null)
  const [newEmployerName, setNewEmployerName] = useState('')
  const [switchJobLoading, setSwitchJobLoading] = useState(false)
  const [switchJobResult, setSwitchJobResult] = useState<any>(null)

  const { user, logout, isAuthenticated } = useAuth()
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
      setLoading(true)
      const [profile, balance, contribs] = await Promise.all([
        userAPI.getProfile(),
        pensionAPI.getBalance(),
        pensionAPI.getContributions(1, 6),
      ])
      setProfileData(profile)
      setBalanceData(balance)
      setContributions(contribs.contributions || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleContribute = async () => {
    setContributionLoading(true)
    setContributionSuccess('')
    try {
      const result = await paymentAPI.simulate(selectedAmount)
      const matchMsg = result.transaction.employerMatch > 0 ? ` Employer added ₹${result.transaction.employerMatch}` : ''
      const chainMsg = result.blockchain?.txHash ? ` | On-chain: ${result.blockchain.txHash.slice(0, 10)}...` : ''
      setContributionSuccess(`₹${selectedAmount} contributed!${matchMsg}${chainMsg}`)
      // Refresh data
      await fetchData()
      setTimeout(() => {
        setShowContributeModal(false)
        setContributionSuccess('')
      }, 3000)
    } catch (err: any) {
      console.error('Contribution failed:', err)
    } finally {
      setContributionLoading(false)
    }
  }

  const handleSwitchJobOpen = async () => {
    setShowSwitchJobModal(true)
    setSwitchJobStep('qr')
    setSwitchJobResult(null)
    setNewEmployerName('')
    try {
      const record = await pensionAPI.getTransferRecord()
      setTransferRecord(record)
    } catch (err) {
      console.error('Failed to get transfer record:', err)
    }
  }

  const handleSwitchJob = async () => {
    if (!newEmployerName.trim()) return
    setSwitchJobLoading(true)
    try {
      const result = await pensionAPI.switchJob(newEmployerName.trim())
      setSwitchJobResult(result)
      setSwitchJobStep('done')
      await fetchData()
    } catch (err: any) {
      console.error('Switch job failed:', err)
    } finally {
      setSwitchJobLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-pulse mb-4">
            <span className="text-black font-bold text-2xl">P</span>
          </div>
          <p className="text-gray-400">Loading your pension data...</p>
        </div>
      </div>
    )
  }

  const displayName = profileData?.name || user?.name || 'User'
  const balance = profileData?.stats?.balance || balanceData?.balance || 0
  const todayContribution = balanceData?.todayContribution || 0
  const monthContribution = balanceData?.monthContribution || 0
  const monthMatch = balanceData?.monthMatch || 0
  const projectedCorpus = profileData?.stats?.projectedCorpus || 0
  const monthlyPension = profileData?.stats?.monthlyPension || 0
  const daysUntilRetirement = profileData?.stats?.daysUntilRetirement || 0
  const riskProfile = profileData?.riskProfile || 'Balanced'
  const employerName = profileData?.employedAt?.companyName || 'Not linked'
  const matchPercent = profileData?.employedAt?.matchPercentage || 0
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-black font-bold text-xl">P</span>
            </div>
            <span className="text-xl font-bold text-white">PENSIONCHAIN</span>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors relative">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">{initials}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-white text-sm font-medium">{displayName}</p>
                <p className="text-gray-500 text-xs capitalize">{user?.role || 'Worker'} Account</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {displayName}! 👋</h1>
              <p className="text-gray-400">Your pension is growing every day. Keep contributing!</p>
            </div>
            <button
              onClick={() => setShowContributeModal(true)}
              className="btn-gold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Contribute Now
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-highlight">
            <p className="text-gray-400 text-sm mb-1">Total Balance</p>
            <p className="text-4xl font-bold text-white mb-2">₹{balance.toLocaleString()}</p>
            <p className="text-green-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +₹{todayContribution} today
            </p>
          </div>

          <div className="card">
            <p className="text-gray-400 text-sm mb-1">This Month</p>
            <p className="text-3xl font-bold text-white mb-2">₹{(monthContribution + monthMatch).toLocaleString()}</p>
            <p className="text-gray-500 text-sm">
              Your: ₹{monthContribution} {monthMatch > 0 && <span className="text-green-500">+ Company Match ✓</span>}
            </p>
          </div>

          <div className="card">
            <p className="text-gray-400 text-sm mb-1">Projected at 60</p>
            <p className="text-3xl font-bold text-gradient-gold">₹{(projectedCorpus / 100000).toFixed(1)}L</p>
            <p className="text-gray-500 text-sm">{Math.round(daysUntilRetirement / 365)} years to go</p>
          </div>

          <div className="card">
            <p className="text-gray-400 text-sm mb-1">Expected Monthly Pension</p>
            <p className="text-3xl font-bold text-green-500">₹{monthlyPension.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">For 15 years</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Allocation */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Portfolio Allocation</h2>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">{riskProfile}</span>
              </div>

              <div className="h-4 rounded-full bg-white/5 overflow-hidden flex mb-4">
                <div className="w-[60%] bg-green-500" title="Government Bonds" />
                <div className="w-[30%] bg-blue-500" title="Stable Yield" />
                <div className="w-[10%] bg-amber-500" title="Growth Assets" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-400 text-sm">Govt. Bonds</span>
                  </div>
                  <p className="text-white font-semibold">60%</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-gray-400 text-sm">Stable Yield</span>
                  </div>
                  <p className="text-white font-semibold">30%</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-gray-400 text-sm">Growth</span>
                  </div>
                  <p className="text-white font-semibold">10%</p>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              </div>

              <div className="space-y-4">
                {contributions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No contributions yet. Make your first one!</p>
                ) : (
                  contributions
                    .filter((tx: any) => tx.type !== 'match')
                    .map((tx: any, index: number) => (
                      <div key={tx.id || index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'contribution' ? 'bg-blue-500/20' :
                            tx.type === 'yield' ? 'bg-amber-500/20' :
                              'bg-red-500/20'
                            }`}>
                            <span className="text-lg">
                              {tx.type === 'contribution' ? '💰' :
                                tx.type === 'yield' ? '📈' : '💸'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {tx.type === 'contribution' ? 'Your Contribution' :
                                tx.type === 'yield' ? 'Yield Earned' :
                                  'Withdrawal'}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <p className={`font-semibold ${tx.type === 'withdrawal' ? 'text-red-500' :
                          tx.type === 'yield' ? 'text-amber-500' :
                            'text-white'
                          }`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount}
                        </p>
                      </div>
                    ))
                )}
                {/* Show aggregated company benefit if there are matches */}
                {contributions.filter((tx: any) => tx.type === 'match').length > 0 && (
                  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/20">
                        <span className="text-lg">🏢</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Company Benefit</p>
                        <p className="text-gray-500 text-sm">Employer matching added to your balance</p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-500">
                      +₹{contributions.filter((tx: any) => tx.type === 'match').reduce((s: number, tx: any) => s + tx.amount + (tx.employerMatch || 0), 0)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/chat" className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-3 block">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="text-white font-medium">FinBot</p>
                    <p className="text-gray-500 text-sm">AI Financial Advisor</p>
                  </div>
                </Link>
                <Link href="/history" className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-3 block">
                  <span className="text-2xl">📜</span>
                  <div>
                    <p className="text-white font-medium">History</p>
                    <p className="text-gray-500 text-sm">View all transactions by employer</p>
                  </div>
                </Link>
                <Link href="/transfer" className="w-full p-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/30 transition-colors text-left flex items-center gap-3 block">
                  <span className="text-2xl">💸</span>
                  <div>
                    <p className="text-white font-medium">Transfer Money</p>
                    <p className="text-green-400 text-sm">Send to workers or employers</p>
                  </div>
                </Link>
                <button onClick={handleSwitchJobOpen} className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <p className="text-white font-medium">Switch Job</p>
                    <p className="text-gray-500 text-sm">Transfer to new employer</p>
                  </div>
                </button>
                <Link href="/blockchain" className="w-full p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 transition-colors text-left flex items-center gap-3 block">
                  <span className="text-2xl">💸</span>
                  <div>
                    <p className="text-white font-medium">Withdraw Funds</p>
                    <p className="text-gray-500 text-sm">Emergency withdrawal available</p>
                  </div>
                </Link>
                <Link href="/blockchain" className="w-full p-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30 transition-colors text-left flex items-center gap-3 block">
                  <span className="text-2xl">⛓️</span>
                  <div>
                    <p className="text-white font-medium">Blockchain Ledger</p>
                    <p className="text-purple-400 text-sm">View on Polygon</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Current Employer */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Current Employer</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <p className="text-white font-medium">{employerName}</p>
                  <p className="text-green-500 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {employerName !== 'Not linked' ? 'Active contributor' : 'No employer linked'}
                  </p>
                </div>
              </div>
              {matchPercent > 0 && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-green-400 text-sm">
                    ✅ Employer matching {matchPercent}% of your contributions
                  </p>
                </div>
              )}
            </div>

            {/* Retirement Progress */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Retirement Progress</h2>
              <div className="relative h-40 flex items-end justify-center">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(balance / Math.max(projectedCorpus, 1)) * 283} 283`}
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#22C55E" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {projectedCorpus > 0 ? ((balance / projectedCorpus) * 100).toFixed(1) : '0.0'}%
                  </p>
                  <p className="text-gray-500 text-sm">of goal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contribute Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md card-highlight">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Make Contribution</h2>
              <button
                onClick={() => { setShowContributeModal(false); setContributionSuccess(''); }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {contributionSuccess ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-green-400 font-medium text-lg">{contributionSuccess}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Select Amount</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[10, 20, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`p-4 rounded-xl border transition-all text-center ${selectedAmount === amount
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10'
                          }`}
                      >
                        <p className="text-white font-bold">₹{amount}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Payment Method</label>
                  <div className="space-y-3">
                    <button className="w-full p-4 rounded-xl border border-amber-500/50 bg-amber-500/10 flex items-center gap-3">
                      <span className="text-2xl">📱</span>
                      <span className="text-white font-medium">UPI (Simulated)</span>
                      <span className="ml-auto text-green-500 text-sm">Demo Mode</span>
                    </button>
                  </div>
                </div>

                {matchPercent > 0 && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🤝</span>
                      <span className="text-green-400 font-medium">Employer Match</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Your employer will add ₹{Math.round(selectedAmount * matchPercent / 100)} ({matchPercent}% match) to your pension!
                    </p>
                  </div>
                )}

                <button
                  onClick={handleContribute}
                  disabled={contributionLoading}
                  className="w-full btn-gold text-lg disabled:opacity-50"
                >
                  {contributionLoading ? 'Processing...' : `Contribute ₹${selectedAmount} Now`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Switch Job Modal */}
      {showSwitchJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md card-highlight max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">🔄 Switch Employer</h2>
              <button
                onClick={() => setShowSwitchJobModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {switchJobStep === 'qr' && (
              <div className="space-y-6">
                {/* QR Code Visual */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-4">Your portable pension record — new employer scans this to onboard you</p>
                  <div className="inline-block p-4 bg-white rounded-2xl mb-4">
                    <div className="w-48 h-48 relative">
                      {/* Stylized QR pattern */}
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        {/* Corner squares */}
                        <rect x="10" y="10" width="50" height="50" rx="4" fill="#000" />
                        <rect x="16" y="16" width="38" height="38" rx="2" fill="#fff" />
                        <rect x="22" y="22" width="26" height="26" rx="2" fill="#000" />
                        <rect x="140" y="10" width="50" height="50" rx="4" fill="#000" />
                        <rect x="146" y="16" width="38" height="38" rx="2" fill="#fff" />
                        <rect x="152" y="22" width="26" height="26" rx="2" fill="#000" />
                        <rect x="10" y="140" width="50" height="50" rx="4" fill="#000" />
                        <rect x="16" y="146" width="38" height="38" rx="2" fill="#fff" />
                        <rect x="22" y="152" width="26" height="26" rx="2" fill="#000" />
                        {/* Data dots */}
                        {Array.from({ length: 12 }, (_, r) =>
                          Array.from({ length: 12 }, (_, c) => {
                            const x = 70 + c * 8; const y = 70 + r * 8
                            const show = ((r * 7 + c * 3) % 3 !== 0)
                            return show ? <rect key={`${r}-${c}`} x={x} y={y} width="6" height="6" rx="1" fill="#000" /> : null
                          })
                        )}
                        {/* Center logo */}
                        <circle cx="100" cy="100" r="16" fill="#f59e0b" />
                        <text x="100" y="105" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">P</text>
                      </svg>
                    </div>
                  </div>
                  {transferRecord?.verificationCode && (
                    <p className="text-amber-400 font-mono text-sm">Code: {transferRecord.verificationCode}</p>
                  )}
                </div>

                {/* Transfer Record Summary */}
                {transferRecord && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Name</span>
                      <span className="text-white text-sm font-medium">{transferRecord.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Current Employer</span>
                      <span className="text-white text-sm">{transferRecord.currentEmployer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Pension Balance</span>
                      <span className="text-green-400 text-sm font-bold">₹{transferRecord.pensionBalance?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Total Contributions</span>
                      <span className="text-white text-sm">{transferRecord.totalTransactions} txns</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Member Since</span>
                      <span className="text-white text-sm">{new Date(transferRecord.memberSince).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSwitchJobStep('scan')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all"
                >
                  📱 Simulate Employer Scan
                </button>
              </div>
            )}

            {switchJobStep === 'scan' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 text-sm">🏢 New employer has scanned your QR code and is reviewing your pension record...</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">New Employer Company Name</label>
                  <input
                    type="text"
                    value={newEmployerName}
                    onChange={(e) => setNewEmployerName(e.target.value)}
                    placeholder="e.g. Infosys, TCS, Wipro..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['Infosys', 'TCS', 'Wipro'].map((company) => (
                    <button
                      key={company}
                      onClick={() => setNewEmployerName(company)}
                      className={`p-2 rounded-lg border text-sm transition-all ${newEmployerName === company
                        ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                        : 'border-white/10 text-gray-400 hover:border-amber-500/50'
                        }`}
                    >
                      {company}
                    </button>
                  ))}
                </div>

                {transferRecord && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 text-sm font-medium mb-1">✅ Pension record verified</p>
                    <p className="text-gray-400 text-xs">Balance of ₹{transferRecord.pensionBalance?.toLocaleString()} will be carried to the new employer. No funds lost!</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setSwitchJobStep('qr')}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSwitchJob}
                    disabled={!newEmployerName.trim() || switchJobLoading}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50"
                  >
                    {switchJobLoading ? '⏳ Transferring...' : '✅ Confirm Transfer'}
                  </button>
                </div>
              </div>
            )}

            {switchJobStep === 'done' && switchJobResult && (
              <div className="text-center py-6 space-y-4">
                <div className="text-5xl mb-2">🎉</div>
                <p className="text-green-400 font-bold text-lg">{switchJobResult.message}</p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">From</span>
                    <span className="text-red-400 text-sm">{switchJobResult.transfer?.from}</span>
                  </div>
                  <div className="flex items-center justify-center text-amber-400 text-lg">→</div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">To</span>
                    <span className="text-green-400 text-sm font-bold">{switchJobResult.transfer?.to}</span>
                  </div>
                  <div className="border-t border-white/5 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Balance Carried</span>
                      <span className="text-white text-sm font-bold">₹{switchJobResult.transfer?.balanceCarried?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">New Match %</span>
                      <span className="text-amber-400 text-sm">{switchJobResult.transfer?.matchPercentage}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">Your pension continues seamlessly with your new employer</p>
                <button
                  onClick={() => setShowSwitchJobModal(false)}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}