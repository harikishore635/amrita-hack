'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { authAPI } from '@/lib/api'

export default function Login() {
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const { login } = useAuth()
  const router = useRouter()

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!phone) {
      setError('Phone number is required')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authAPI.sendOtp(phone)
      setOtpSent(true)
      setSuccess('OTP sent! Check backend console for the code.')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Enter the OTP')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authAPI.verifyOtp(phone, otp)
      setSuccess('Phone verified! Please login with email & password.')
      setMethod('email')
    } catch (err: any) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span className="text-black font-bold text-2xl">P</span>
          </div>
          <span className="text-2xl font-bold text-white">PENSIONCHAIN</span>
        </Link>

        {/* Login Card */}
        <div className="card">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-center mb-8">Access your pension account</p>

          {/* Error / Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Login Method Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-8">
            <button
              onClick={() => { setMethod('email'); setError(''); }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${method === 'email'
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              ✉️ Email
            </button>
            <button
              onClick={() => { setMethod('phone'); setError(''); }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${method === 'phone'
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              📱 Phone OTP
            </button>
          </div>

          {method === 'email' ? (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Email Address <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full input-dark"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full input-dark"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                />
              </div>

              <button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full btn-gold disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Phone Number</label>
                    <div className="flex gap-3">
                      <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                        +91
                      </div>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        className="flex-1 input-dark"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full btn-gold disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      className="w-full input-dark text-center text-2xl tracking-[0.5em]"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <p className="text-gray-500 text-xs mt-2 text-center">
                      OTP sent to +91 {phone} (check backend console)
                    </p>
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full btn-gold disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="w-full text-gray-500 text-sm hover:text-white"
                  >
                    ← Change phone number
                  </button>
                </>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Demo Accounts Info */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-3">
            <p className="text-blue-400 font-medium text-sm">Demo Accounts (click to fill)</p>
            <div className="text-gray-400 text-xs space-y-2">
              <button onClick={() => { setEmail('worker1@pensionchain.com'); setPassword('worker123'); setMethod('email'); }} className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition">
                <p>👷 Worker 1: <span className="text-white">worker1@pensionchain.com</span> / <span className="text-white">worker123</span></p>
              </button>
              <button onClick={() => { setEmail('worker2@pensionchain.com'); setPassword('worker123'); setMethod('email'); }} className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition">
                <p>👷 Worker 2: <span className="text-white">worker2@pensionchain.com</span> / <span className="text-white">worker123</span></p>
              </button>
              <button onClick={() => { setEmail('employer1@pensionchain.com'); setPassword('employer123'); setMethod('email'); }} className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition">
                <p>🏢 Employer 1: <span className="text-white">employer1@pensionchain.com</span> / <span className="text-white">employer123</span></p>
              </button>
              <button onClick={() => { setEmail('employer2@pensionchain.com'); setPassword('employer123'); setMethod('email'); }} className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition">
                <p>🏢 Employer 2: <span className="text-white">employer2@pensionchain.com</span> / <span className="text-white">employer123</span></p>
              </button>
            </div>
          </div>
        </div>

        {/* Signup Link */}
        <p className="text-gray-500 text-center mt-8">
          New to PensionChain? <Link href="/signup" className="text-amber-500 hover:underline">Create Account</Link>
        </p>

        {/* Help */}
        <div className="text-center mt-6">
          <Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
            Need help? Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}