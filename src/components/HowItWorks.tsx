export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Sign Up in Minutes',
      description: 'Verify your identity with Aadhaar. Your secure blockchain wallet is created automatically.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      number: '02', 
      title: 'Contribute Daily',
      description: 'Start with ₹10/day via UPI. Your employer automatically matches 50% of your contribution.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      number: '03',
      title: 'Watch It Grow',
      description: 'Your money earns 7-9% returns through our multi-asset DeFi strategy with inflation protection.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      number: '04',
      title: 'Retire with Dignity',
      description: 'At 60, receive ₹5,200+/month pension or withdraw your ₹6.7L+ corpus. Your choice.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-black to-gray-900/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-amber-500 font-medium mb-4 tracking-wider">HOW IT WORKS</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            FROM ₹0 TO<br />
            <span className="text-gradient-gold">₹6.7 LAKHS</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Four simple steps to transform your retirement. 
            Just 30 minutes to set up, then automatic savings forever.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step Number */}
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full border-2 border-amber-500/30 bg-black flex items-center justify-center relative z-10">
                    <div className="text-amber-500">{step.icon}</div>
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-black text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Journey - Timeline */}
        <div className="mt-20 p-8 rounded-3xl border border-white/10 bg-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm mb-1">Age 30 - Start Contributing</p>
              <p className="text-3xl font-bold text-white">₹0</p>
              <p className="text-gray-500 text-sm">Beginning balance</p>
            </div>
            
            <div className="hidden md:block flex-1 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
            
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">30 Years of ₹10/day</p>
              <p className="text-3xl font-bold text-amber-500">₹3.65L</p>
              <p className="text-gray-500 text-sm">Your contributions</p>
            </div>
            
            <div className="hidden md:block flex-1 h-2 rounded-full bg-gradient-to-r from-yellow-500 to-green-500" />
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mb-1">Age 60 - Retirement</p>
              <p className="text-3xl font-bold text-green-500">₹6.7L+</p>
              <p className="text-gray-500 text-sm">With employer match + returns</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}