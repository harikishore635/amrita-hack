export default function Stats() {
  const stats = [
    {
      value: '450M+',
      label: 'Informal Workers',
      description: 'Without pension access'
    },
    {
      value: '₹10',
      label: 'Daily Minimum',
      description: 'Start your pension today'
    },
    {
      value: '50%',
      label: 'Employer Match',
      description: 'Auto-enforced by smart contract'
    },
    {
      value: '₹6.7L',
      label: 'Retirement Corpus',
      description: 'After 30 years (projected)'
    },
  ]

  return (
    <section className="py-24 px-6 bg-black border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all duration-300"
            >
              <p className="text-4xl md:text-5xl font-bold text-gradient-gold mb-2">
                {stat.value}
              </p>
              <p className="text-white font-semibold mb-1">
                {stat.label}
              </p>
              <p className="text-gray-500 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}