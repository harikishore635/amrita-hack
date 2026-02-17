'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const [showContributeModal, setShowContributeModal] = useState(false)

  // Mock user data
  const user = {
    name: 'Ramesh Kumar',
    balance: 12450,
    todayContribution: 15,
    monthContribution: 450,
    employerMatch: 225,
    totalContributed: 8500,
    totalEarnings: 3950,
    daysUntilRetirement: 8760,
    projectedCorpus: 687000,
    monthlyPension: 5200,
    riskProfile: 'Balanced',
    currentEmployer: 'ABC Construction Pvt Ltd',
  }

  const recentTransactions = [
    { date: 'Today', type: 'contribution', amount: 10, employer: false },
    { date: 'Today', type: 'match', amount: 5, employer: true },
    { date: 'Yesterday', type: 'contribution', amount: 10, employer: false },
    { date: 'Yesterday', type: 'match', amount: 5, employer: true },
    { date: '14 Feb', type: 'yield', amount: 12, employer: false },
    { date: '13 Feb', type: 'contribution', amount: 10, employer: false },
  ]

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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-xs text-black flex items-center justify-center">2</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-medium">RK</span>
              </div>
              <div className="hidden md:block">
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-gray-500 text-xs">Worker Account</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {user.name}! 
                <svg className="inline w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5h18" />
                </svg>
              </h1>
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
          {/* Total Balance */}
          <div className="card-highlight">
            <p className="text-gray-400 text-sm mb-1">Total Balance</p>
            <p className="text-4xl font-bold text-white mb-2">₹{user.balance.toLocaleString()}</p>
            <p className="text-green-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +₹{user.todayContribution} today
            </p>
          </div>

          {/* This Month */}
          <div className="card">
            <p className="text-gray-400 text-sm mb-1">This Month</p>
            <p className="text-3xl font-bold text-white mb-2">₹{user.monthContribution}</p>
            <p className="text-gray-500 text-sm">
              Your: ₹{user.monthContribution - user.employerMatch} | Match: ₹{user.employerMatch}
            </p>
          </div>

          {/* Projected Corpus */}
          <div className="card">
            <p className="text-gray-400 text-sm mb-1">Projected at 60</p>
            <p className="text-3xl font-bold text-gradient-gold">₹{(user.projectedCorpus/100000).toFixed(1)}L</p>
            <p className="text-gray-500 text-sm">{(user.daysUntilRetirement/365).toFixed(0)} years to go</p>
          </div>

          {/* Monthly Pension */}
          <div className="card">
            <p className="text-gray-400 text-sm mb-1">Expected Monthly Pension</p>
            <p className="text-3xl font-bold text-green-500">₹{user.monthlyPension.toLocaleString()}</p>
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
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">{user.riskProfile}</span>
              </div>
              
              {/* Allocation Bar */}
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
                <Link href="/history" className="text-amber-500 text-sm hover:underline">View All</Link>
              </div>
              
              <div className="space-y-4">
                {recentTransactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'contribution' ? 'bg-blue-500/20' :
                        tx.type === 'match' ? 'bg-green-500/20' :
                        'bg-amber-500/20'
                      }`}>
                        {tx.type === 'contribution' ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        ) : tx.type === 'match' ? (
                          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {tx.type === 'contribution' ? 'Your Contribution' :
                           tx.type === 'match' ? 'Employer Match' :
                           'Yield Earned'}
                        </p>
                        <p className="text-gray-500 text-sm">{tx.date}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      tx.type === 'match' ? 'text-green-500' :
                      tx.type === 'yield' ? 'text-amber-500' :
                      'text-white'
                    }`}>
                      +₹{tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-white font-medium">AI Advisor</p>
                    <p className="text-gray-500 text-sm">Get personalized advice</p>
                  </div>
                </button>
                <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div>
                    <p className="text-white font-medium">Switch Job</p>
                    <p className="text-gray-500 text-sm">Transfer to new employer</p>
                  </div>
                </button>
                <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-white font-medium">Emergency Withdrawal</p>
                    <p className="text-gray-500 text-sm">Access funds if needed</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Current Employer */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Current Employer</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">{user.currentEmployer}</p>
                  <p className="text-green-500 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Active contributor
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-sm">
                  <svg className="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Employer matching 50% of your contributions
                </p>
              </div>
            </div>

            {/* Retirement Progress */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Retirement Progress</h2>
              <div className="relative h-40 flex items-end justify-center">
                {/* Progress Circle */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(user.balance / user.projectedCorpus) * 283} 283`}
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
                  <p className="text-3xl font-bold text-white">{((user.balance / user.projectedCorpus) * 100).toFixed(1)}%</p>
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
                onClick={() => setShowContributeModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Select Amount</label>
                <div className="grid grid-cols-4 gap-3">
                  {[10, 20, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      className="p-4 rounded-xl border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all text-center"
                    >
                      <p className="text-white font-bold">₹{amount}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Payment Method</label>
                <div className="space-y-3">
                  <button className="w-full p-4 rounded-xl border border-amber-500/50 bg-amber-500/10 flex items-center gap-3">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white font-medium">UPI</span>
                    <span className="ml-auto text-green-500 text-sm">Recommended</span>
                  </button>
                  <button className="w-full p-4 rounded-xl border border-white/10 hover:border-white/20 flex items-center gap-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-white font-medium">Debit Card</span>
                  </button>
                </div>
              </div>

              {/* Employer Match Info */}
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v-2A2 2 0 00 15 6h-2m2 13a9 9 0 01-9-9V6h9v13z" />
                  </svg>
                  <span className="text-green-400 font-medium">Employer Match</span>
                </div>
                <p className="text-gray-400 text-sm">Your employer will add ₹5 (50% match) to your pension!</p>
              </div>

              {/* Contribute Button */}
              <button className="w-full btn-gold text-lg">
                Contribute ₹10 Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}