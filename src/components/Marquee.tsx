export default function Marquee() {
  const items = [
    'SECURE',
    'FAST', 
    'INNOVATIVE',
    'TRUSTED',
    'BLOCKCHAIN-POWERED',
    'AI-ENABLED',
    'PORTABLE',
    'TRANSPARENT',
  ]

  return (
    <section className="py-8 border-y border-white/5 bg-black overflow-hidden">
      <div className="relative">
        <div className="marquee-content whitespace-nowrap">
          {/* Duplicate items for seamless loop */}
          {[...items, ...items].map((item, index) => (
            <span key={index} className="inline-flex items-center mx-8">
              <span className="text-xl md:text-2xl font-bold text-gray-600 tracking-wider">
                {item}
              </span>
              <span className="ml-8 text-amber-500">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}