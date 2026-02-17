'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const [method, setMethod] = useState<'phone' | 'biometric'>('phone')

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

          {/* Login Method Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-8">
            <button
              onClick={() => setMethod('phone')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                method === 'phone' 
                  ? 'bg-amber-500 text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Phone
            </button>
            <button
              onClick={() => setMethod('biometric')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                method === 'biometric' 
                  ? 'bg-amber-500 text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5h18" />
              </svg>
              Biometric
            </button>
          </div>

          {method === 'phone' ? (
            <div className="space-y-6">
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
                  />
                </div>
              </div>

              <button className="w-full btn-gold">
                Send OTP
              </button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-white/5 border-2 border-amber-500/50 flex items-center justify-center">
                <svg className="w-16 h-16 text-amber-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5h18" />
                </svg>
              </div>
              <p className="text-gray-400">Place your finger on the sensor to login</p>
              <button className="w-full btn-gold">
                Use Biometric
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Alternative Options */}
          <div className="space-y-3">
            <button className="w-full p-4 rounded-xl border border-white/10 hover:border-white/20 flex items-center justify-center gap-3 transition-colors">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-white">Login as Employer</span>
            </button>
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