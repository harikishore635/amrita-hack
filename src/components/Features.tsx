export default function Features() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Perfect Portability',
      description: 'Your pension follows you across all jobs. Switch employers without losing a single rupee.',
      highlight: 'Blockchain-powered wallet'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: 'Micro Contributions',
      description: 'Start with just ₹10/day. No more ₹50,000 minimum barriers. Everyone can save.',
      highlight: '₹10/day minimum'
    },
    {
      icon: '🤖',
      title: 'AI Financial Advisor',
      description: 'Get personalized retirement advice in Hindi, Tamil, Telugu, and 9 more languages.',
      highlight: 'Voice-enabled in 12 languages'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Enforced Employer Match',
      description: 'Smart contracts guarantee your employer contributes their share. No more excuses.',
      highlight: '50% automatic matching'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Inflation Protection',
      description: 'Multi-asset strategy with government bonds + DeFi yields to beat inflation.',
      highlight: '7-9% target returns'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Full Transparency',
      description: 'Track every contribution in real-time on the blockchain. No hidden fees.',
      highlight: '0.25% vs 2% traditional'
    },
  ]

  return (
    <section id="features" className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-amber-500 font-medium mb-4 tracking-wider">FEATURES</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            EASY TO USE.<br />
            <span className="text-gradient">EVERYWHERE.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            PensionChain combines blockchain security with mobile simplicity,
            making retirement savings accessible to every worker.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card group hover:border-amber-500/30 cursor-pointer"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 
                            group-hover:bg-amber-500/10 transition-colors">
                <div className="text-white group-hover:text-amber-500 transition-colors">{feature.icon}</div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-500 transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Highlight Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="text-sm text-gray-300">{feature.highlight}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            Ready to secure your future?
          </p>
          <button className="btn-gold">
            Get Started Free
          </button>
        </div>
      </div>
    </section>
  )
}