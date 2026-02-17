'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EmployerDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')

  // Mock employer data
  const employer = {
    name: 'ABC Construction Pvt Ltd',
    totalEmployees: 156,
    activeContributors: 142,
    monthlyContribution: 45600,
    totalContributed: 234500,
    pendingPayments: 12400,
  }

  const employees = [
    { id: 1, name: 'Ramesh Kumar', role: 'Mason', contribution: 450, match: 225, status: 'active' },
    { id: 2, name: 'Suresh Patel', role: 'Carpenter', contribution: 300, match: 150, status: 'active' },
    { id: 3, name: 'Mohammed Ali', role: 'Electrician', contribution: 600, match: 300, status: 'active' },
    { id: 4, name: 'Lakshmi Devi', role: 'Helper', contribution: 200, match: 100, status: 'pending' },
    { id: 5, name: 'Ravi Singh', role: 'Plumber', contribution: 400, match: 200, status: 'active' },
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
            <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium ml-2">
              Employer
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-medium">AC</span>
              </div>
              <div className="hidden md:block">
                <p className="text-white text-sm font-medium">{employer.name}</p>
                <p className="text-gray-500 text-xs">Employer Account</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Employer Dashboard</h1>
            <p className="text-gray-400">Manage employee pensions and compliance</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
            <button className="btn-gold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Employee
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Employees</span>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{employer.totalEmployees}</p>
            <p className="text-green-500 text-sm">+12 this month</p>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Contributors</span>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-green-500">{employer.activeContributors}</p>
            <p className="text-gray-500 text-sm">{((employer.activeContributors/employer.totalEmployees)*100).toFixed(0)}% compliance</p>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">This Month</span>
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">₹{(employer.monthlyContribution/1000).toFixed(1)}K</p>
            <p className="text-gray-500 text-sm">Employee + Matching</p>
          </div>
          
          <div className="card-highlight">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Pending Payments</span>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-amber-500">₹{(employer.pendingPayments/1000).toFixed(1)}K</p>
            <button className="text-amber-500 text-sm hover:underline">Pay Now →</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10 mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'employees', label: 'Employees' },
            { id: 'payroll', label: 'Payroll' },
            { id: 'compliance', label: 'Compliance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`pb-4 px-2 font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'text-amber-500 border-b-2 border-amber-500'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Employee List */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Employee Contributions</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search employees..."
                className="input-dark w-64"
              />
              <select className="input-dark w-40">
                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Employee</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Role</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-medium">Contribution</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-medium">Your Match</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <span className="text-white text-sm">{emp.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className="text-white font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-400">{emp.role}</td>
                    <td className="py-4 px-4 text-right text-white">₹{emp.contribution}</td>
                    <td className="py-4 px-4 text-right text-green-500">₹{emp.match}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {emp.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-500 text-sm">Showing 5 of {employer.totalEmployees} employees</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 rounded-lg bg-amber-500 text-black font-medium">
                1
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
                2
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Panel */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
          <p className="text-white">
            <span className="text-amber-500 font-bold">{employer.activeContributors}</span> employees selected
          </p>
          <button className="btn-gold py-3">
            Process Monthly Contribution
          </button>
          <button className="btn-secondary py-3">
            Send Reminders
          </button>
        </div>
      </div>
    </div>
  )
}