'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/20 via-black to-black" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} 
      />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-400">Secure • Fast • Blockchain-Powered</span>
        </div>

        {/* Main Headline - Large Typography */}
        <h1 className="font-display font-bold leading-none tracking-tight mb-8">
          <span className="block text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] text-metallic">
            ULTIMATE
          </span>
          <span className="block text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] text-metallic opacity-60">
            PENSION
          </span>
          <span className="block text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] text-metallic opacity-40">
            SOLUTION
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10">
          PensionChain empowers India's <span className="text-white">450 million informal workers</span> to 
          build retirement savings with just <span className="text-amber-500">₹10/day</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup" className="btn-gold text-lg">
            Start Contributing Now
          </Link>
          <Link href="#how-it-works" className="btn-secondary text-lg">
            See How It Works
          </Link>
        </div>

        {/* App Preview - Phone Mockup */}
        <div className="relative mt-10">
          <div className="relative mx-auto w-[280px] sm:w-[320px] h-[560px] sm:h-[640px]">
            {/* Phone Frame */}
            <div className="absolute inset-0 rounded-[3rem] border-4 border-gray-800 bg-black shadow-2xl overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
              
              {/* Screen Content */}
              <div className="relative h-full p-6 pt-10 bg-gradient-to-b from-gray-900 to-black">
                {/* Status Bar */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-6">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                    </svg>
                  </div>
                </div>

                {/* App Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <span className="text-black font-bold text-2xl">₹</span>
                  </div>
                  <h3 className="text-white font-semibold">Total Balance</h3>
                </div>

                {/* Balance Display */}
                <div className="text-center mb-8">
                  <p className="text-4xl font-bold text-white mb-1">₹12,450</p>
                  <p className="text-green-500 text-sm">+₹45 today</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-gray-400 text-xs">This Month</p>
                    <p className="text-white font-semibold">₹450</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-gray-400 text-xs">Employer Match</p>
                    <p className="text-green-500 font-semibold">+₹225</p>
                  </div>
                </div>

                {/* Contribute Button */}
                <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-2xl mb-4">
                  Contribute ₹10 Today
                </button>

                {/* Bottom Nav */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-around">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-400">Home</span>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-400">AI Chat</span>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-400">Stats</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection */}
            <div className="absolute -bottom-20 left-0 right-0 h-20 bg-gradient-to-b from-gray-800/20 to-transparent rounded-b-[3rem] blur-sm" />
          </div>

          {/* Floating elements */}
          <div className="hidden lg:block absolute -left-20 top-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Contribution Received</p>
                <p className="text-gray-400 text-xs">₹15 from Employer</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block absolute -right-20 top-40 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-500">🤖</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">AI Advisor</p>
                <p className="text-gray-400 text-xs">"You're on track for ₹6.7L!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}