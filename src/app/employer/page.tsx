'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { employerAPI } from '@/lib/api'

export default function EmployerDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [bulkAmount, setBulkAmount] = useState(10)
  const [success, setSuccess] = useState('')

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
      const result = await employerAPI.getEmployees()
      setData(result)
    } catch (err: any) {
      console.error('Failed to fetch employer data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkContribute = async () => {
    if (selectedEmployees.length === 0) return
    setBulkLoading(true)
    setSuccess('')
    try {
      const result = await employerAPI.bulkContribute(selectedEmployees, bulkAmount)
      setSuccess(`✅ Contributed for ${selectedEmployees.length} employees! Total: ₹${result.totalAmount}`)
      setSelectedEmployees([])
      await fetchData()
    } catch (err: any) {
      console.error('Bulk contribute failed:', err)
    } finally {
      setBulkLoading(false)
    }
  }

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (data?.employees) {
      setSelectedEmployees(
        selectedEmployees.length === data.employees.length
          ? []
          : data.employees.map((e: any) => e.id)
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center animate-pulse mb-4">
            <span className="text-white font-bold text-2xl">🏢</span>
          </div>
          <p className="text-gray-400">Loading employer dashboard...</p>
        </div>
      </div>
    )
  }

  const employer = data?.employer
  const employees = data?.employees || []

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-black font-bold text-xl">P</span>
            </div>
            <span className="text-xl font-bold text-white">PENSIONCHAIN</span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">EMPLOYER</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden md:inline">{user?.email}</span>
            <button onClick={logout} className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 transition-colors" title="Logout">
              <svg className="w-5 h-5 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Company Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{employer?.companyName || 'Company Dashboard'}</h1>
          <p className="text-gray-400">Manage employee pension contributions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-highlight">
            <p className="text-gray-400 text-sm">Total Employees</p>
            <p className="text-3xl font-bold text-white">{employer?.totalEmployees || 0}</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm">Active Contributors</p>
            <p className="text-3xl font-bold text-green-500">{employer?.activeContributors || 0}</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm">Match Rate</p>
            <p className="text-3xl font-bold text-amber-500">{employer?.matchPercentage || 0}%</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm">Compliance</p>
            <p className="text-3xl font-bold text-green-500">98%</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employee List */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Employees</h2>
                <button
                  onClick={selectAll}
                  className="text-amber-500 text-sm hover:underline"
                >
                  {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-4">
                {employees.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No employees found</p>
                ) : (
                  employees.map((emp: any) => (
                    <div
                      key={emp.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${selectedEmployees.includes(emp.id)
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-white/5 hover:border-white/10'
                        }`}
                      onClick={() => toggleEmployee(emp.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedEmployees.includes(emp.id)
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-gray-600'
                          }`}>
                          {selectedEmployees.includes(emp.id) && (
                            <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {emp.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{emp.name}</p>
                          <p className="text-gray-500 text-sm">{emp.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          ₹{(emp.totalContributed || 0).toLocaleString()}
                        </p>
                        <p className={`text-sm ${emp.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                          {emp.status === 'active' ? '● Active' : '○ Pending'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="space-y-6">
            <div className="card-highlight">
              <h2 className="text-lg font-bold text-white mb-4">Bulk Contribute</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">
                    {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
                  </p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Amount per employee</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 50, 100].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setBulkAmount(amt)}
                        className={`py-3 rounded-xl border text-center ${bulkAmount === amt
                            ? 'border-amber-500 bg-amber-500/20 text-amber-500'
                            : 'border-white/10 text-gray-400 hover:border-white/20'
                          }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {employer && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 text-sm">
                      Match: ₹{Math.round(bulkAmount * (employer.matchPercentage / 100))} per employee ({employer.matchPercentage}%)
                    </p>
                    <p className="text-green-400 text-sm font-medium mt-1">
                      Total: ₹{((bulkAmount + bulkAmount * (employer.matchPercentage / 100)) * selectedEmployees.length).toLocaleString()}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleBulkContribute}
                  disabled={selectedEmployees.length === 0 || bulkLoading}
                  className="w-full btn-gold disabled:opacity-50"
                >
                  {bulkLoading
                    ? 'Processing...'
                    : `Process ₹${(bulkAmount * selectedEmployees.length).toLocaleString()} Contribution`}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="text-white font-medium">Download Report</p>
                    <p className="text-gray-500 text-sm">Monthly compliance report</p>
                  </div>
                </button>
                <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-3">
                  <span className="text-2xl">➕</span>
                  <div>
                    <p className="text-white font-medium">Add Employee</p>
                    <p className="text-gray-500 text-sm">Register new worker</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}