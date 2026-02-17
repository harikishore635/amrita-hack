export default function Pricing() {
  const plans = [
    {
      name: 'Basic',
      tagline: 'For individual savers',
      price: '₹10',
      period: '/day',
      features: [
        'Daily micro-contributions',
        'Blockchain wallet',
        'Real-time tracking',
        'Basic AI advisor',
        '0.25% platform fee',
        'Emergency withdrawal access',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Premium',
      tagline: 'Most Popular',
      price: '₹20',
      period: '/day',
      features: [
        'Everything in Basic',
        'Priority AI advisor',
        'Advanced portfolio analytics',
        'Family account linking',
        'Tax optimization guidance',
        'Video consultations',
        'Dedicated support',
      ],
      cta: 'Get Premium',
      popular: true,
    },
    {
      name: 'Employer',
      tagline: 'For businesses',
      price: '₹5',
      period: '/employee/month',
      features: [
        'Bulk employee onboarding',
        'Automated payroll integration',
        'Compliance dashboard',
        'Tax benefit reports',
        'API access',
        'Custom matching ratios',
        '24/7 priority support',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-amber-500 font-medium mb-4 tracking-wider">PRICING</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            SELECT YOUR<br />
            <span className="text-gradient">PRICING PLAN</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. 
            Start free and upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-3xl p-8 ${
                plan.popular 
                  ? 'card-highlight scale-105' 
                  : 'card'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-black text-sm font-bold">
                  MOST POPULAR
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button 
                className={`w-full py-4 rounded-full font-semibold transition-all ${
                  plan.popular 
                    ? 'bg-amber-500 text-black hover:bg-amber-400' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-gray-500 mt-12">
          All plans include blockchain security • 24/7 uptime • Regular updates
        </p>
      </div>
    </section>
  )
}