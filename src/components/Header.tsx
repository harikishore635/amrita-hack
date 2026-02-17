'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span className="text-black font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-bold text-white">PENSIONCHAIN</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">
            Plans
          </Link>
          <Link href="#ai-advisor" className="text-gray-400 hover:text-white transition-colors">
            AI Advisor
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-white hover:text-gray-300 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="btn-primary text-sm py-3 px-6">
            Start Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/5 p-6 space-y-4">
          <Link href="#features" className="block text-gray-400 hover:text-white py-2">Features</Link>
          <Link href="#how-it-works" className="block text-gray-400 hover:text-white py-2">How It Works</Link>
          <Link href="#pricing" className="block text-gray-400 hover:text-white py-2">Plans</Link>
          <Link href="#ai-advisor" className="block text-gray-400 hover:text-white py-2">AI Advisor</Link>
          <div className="pt-4 border-t border-white/10 space-y-3">
            <Link href="/login" className="block text-white py-2">Login</Link>
            <Link href="/signup" className="btn-primary block text-center">Start Now</Link>
          </div>
        </div>
      )}
    </header>
  )
}