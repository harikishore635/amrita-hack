'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { authAPI, userAPI } from '@/lib/api'

export default function Signup() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: '',
    name: '',
    age: '',
    monthlyIncome: '',
    riskProfile: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const { register } = useAuth()
  const router = useRouter()

  const handleStep1 = async () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setStep(2)
  }

  const handleStep2SendOtp = async () => {
    setError('')
    setLoading(true)
    try {
      // Register the user first
      const result = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name || formData.email.split('@')[0],
        phone: formData.phone || undefined,
      })
      setSuccess('Account created! Verification OTP sent to your email.')
      setStep(3)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleStep3VerifyOtp = async () => {
    if (!formData.otp) {
      setError('Enter the OTP')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authAPI.verifyEmailOtp(formData.email, formData.otp)
      setSuccess('Email verified!')
      setStep(4)
    } catch (err: any) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleStep4Complete = async () => {
    if (!formData.name) {
      setError('Name is required')
      return
    }
    setError('')
    setLoading(true)
    try {
      await userAPI.updateProfile({
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        monthlyIncome: formData.monthlyIncome,
        riskProfile: formData.riskProfile || 'Balanced',
      })
      router.push('/dashboard')
    } catch (err: any) {
      // Still navigate to dashboard even if profile update fails
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-black font-bold text-xl">P</span>
            </div>
            <span className="text-xl font-bold text-white">PENSIONCHAIN</span>
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s < step ? 'bg-green-500' :
                    s === step ? 'bg-amber-500' :
                      'bg-white/10'
                  }`}>
                  {s < step ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={s === step ? 'text-black' : 'text-gray-500'}>{s}</span>
                  )}
                </div>
                {s < 4 && <div className={`w-8 h-px ${s < step ? 'bg-green-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

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

          {/* Step 1: Email & Password */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
                <p className="text-gray-400">Email is required for login</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Email Address <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full input-dark"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Password <span className="text-red-400">*</span></label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  className="w-full input-dark"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Confirm Password <span className="text-red-400">*</span></label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  className="w-full input-dark"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <button onClick={handleStep1} className="w-full btn-gold">
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Phone Number */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Phone number (optional)</h1>
                <p className="text-gray-400">Add your phone for additional security</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Phone Number</label>
                <div className="flex gap-3">
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    className="flex-1 input-dark text-xl tracking-wider"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={handleStep2SendOtp}
                disabled={loading}
                className="w-full btn-gold disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account & Send Email OTP'}
              </button>

              <button onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:text-white">
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Verify Email</h1>
                <p className="text-gray-400">Enter the 6-digit code sent to {formData.email}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Enter OTP</label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="w-full input-dark text-center text-2xl tracking-[0.5em]"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                />
                <p className="text-gray-500 text-xs mt-2 text-center">
                  Check your email inbox for the verification code
                </p>
              </div>

              <button
                onClick={handleStep3VerifyOtp}
                disabled={loading}
                className="w-full btn-gold disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                onClick={async () => {
                  try {
                    await authAPI.sendEmailOtp(formData.email)
                    setSuccess('New OTP sent to your email!')
                  } catch { setError('Failed to resend OTP') }
                }}
                className="w-full text-amber-500 text-sm hover:underline"
              >
                Resend OTP
              </button>
            </div>
          )}

          {/* Step 4: Profile Setup */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Almost there!</h1>
                <p className="text-gray-400">Tell us a bit about yourself</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Your Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="input-dark"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Your Age</label>
                  <input
                    type="number"
                    placeholder="35"
                    className="input-dark"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Monthly Income Range</label>
                  <select
                    className="input-dark"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  >
                    <option value="">Select range</option>
                    <option value="₹5,000 - ₹10,000">₹5,000 - ₹10,000</option>
                    <option value="₹10,000 - ₹20,000">₹10,000 - ₹20,000</option>
                    <option value="₹20,000 - ₹30,000">₹20,000 - ₹30,000</option>
                    <option value="₹30,000+">₹30,000+</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Risk Preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Safe', 'Balanced', 'Growth'].map((risk) => (
                      <button
                        key={risk}
                        className={`p-3 rounded-xl border ${formData.riskProfile === risk
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-white/10 hover:border-white/20'
                          } text-white text-sm`}
                        onClick={() => setFormData({ ...formData, riskProfile: risk })}
                      >
                        {risk}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleStep4Complete}
                disabled={loading}
                className="w-full btn-gold disabled:opacity-50 text-center"
              >
                {loading ? 'Setting up...' : 'Create My Pension Account'}
              </button>
            </div>
          )}

          {/* Login Link */}
          <p className="text-gray-500 text-center mt-8">
            Already have an account? <Link href="/login" className="text-amber-500 hover:underline">Login</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-amber-500/10 to-black p-8">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Start with<br />
            <span className="text-gradient-gold">₹10/day</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-md mb-8">
            Join 10,000+ workers already building their retirement savings with PensionChain.
          </p>

          {/* Feature List */}
          <div className="space-y-4 text-left max-w-sm mx-auto">
            {[
              '🔒 Blockchain-secured savings',
              '🤝 50% employer matching',
              '🤖 AI-powered planning',
              '📱 Works on any smartphone',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                <span className="text-xl">{feature.split(' ')[0]}</span>
                <span className="text-gray-300">{feature.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}