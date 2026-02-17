'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Signup() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    aadhaar: '',
    name: '',
    age: '',
    monthlyIncome: '',
    riskProfile: '',
  })

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s < step ? 'bg-green-500' :
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

          {/* Step 1: Phone Verification */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Enter your phone number</h1>
                <p className="text-gray-400">We'll send you a verification code</p>
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
                    className="flex-1 input-dark text-2xl tracking-wider"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <button onClick={handleNext} className="w-full btn-gold">
                Send OTP
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Verify OTP</h1>
                <p className="text-gray-400">Enter the 6-digit code sent to +91 {formData.phone}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Enter OTP</label>
                <div className="flex gap-3 justify-between">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-12 h-14 input-dark text-center text-2xl"
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-500 text-sm text-center">
                Didn't receive? <button className="text-amber-500">Resend OTP</button>
              </p>

              <button onClick={handleNext} className="w-full btn-gold">
                Verify & Continue
              </button>
            </div>
          )}

          {/* Step 3: Aadhaar KYC */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Verify Identity</h1>
                <p className="text-gray-400">We use Aadhaar for secure identity verification</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Aadhaar Number</label>
                <input
                  type="text"
                  placeholder="XXXX XXXX XXXX"
                  className="input-dark text-xl tracking-wider"
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({...formData, aadhaar: e.target.value})}
                />
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-blue-400 font-medium">Secure & Private</p>
                    <p className="text-gray-500 text-sm">Your Aadhaar info is encrypted and never shared. We only verify your identity.</p>
                  </div>
                </div>
              </div>

              <button onClick={handleNext} className="w-full btn-gold">
                Verify Aadhaar
              </button>
            </div>
          )}

          {/* Step 4: Profile Setup */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Almost there!</h1>
                <p className="text-gray-400">Tell us a bit about yourself</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="input-dark"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Your Age</label>
                  <input
                    type="number"
                    placeholder="35"
                    className="input-dark"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Monthly Income Range</label>
                  <select className="input-dark">
                    <option value="">Select range</option>
                    <option value="1">₹5,000 - ₹10,000</option>
                    <option value="2">₹10,000 - ₹20,000</option>
                    <option value="3">₹20,000 - ₹30,000</option>
                    <option value="4">₹30,000+</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Risk Preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Safe', 'Balanced', 'Growth'].map((risk) => (
                      <button
                        key={risk}
                        className={`p-3 rounded-xl border ${
                          formData.riskProfile === risk 
                            ? 'border-amber-500 bg-amber-500/10' 
                            : 'border-white/10 hover:border-white/20'
                        } text-white text-sm`}
                        onClick={() => setFormData({...formData, riskProfile: risk})}
                      >
                        {risk}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/dashboard" className="block w-full btn-gold text-center">
                Create My Pension Account
              </Link>
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
              'Blockchain-secured savings',
              '🤝 50% employer matching',
              '🤖 AI-powered planning',
              'Works on any smartphone',
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