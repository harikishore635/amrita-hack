export default function Testimonials() {
  const testimonials = [
    {
      name: 'Ramesh Kumar',
      role: 'Construction Worker',
      location: 'Mumbai',
      quote: 'मैंने कभी नहीं सोचा था कि मैं भी पेंशन ले पाऊंगा। अब मेरी बेटी की शादी के बाद भी मुझे बच्चों पर निर्भर नहीं रहना पड़ेगा।',
      quoteEn: "I never thought I could have a pension. Now even after my daughter's wedding, I won't depend on my children.",
      avatar: 'RK',
      amount: '₹8,500 saved'
    },
    {
      name: 'Lakshmi Devi',
      role: 'Domestic Worker',
      location: 'Chennai',
      quote: 'எனக்கு வங்கி கணக்கு கூட இல்லை. இப்போது என் பேரனுக்கு சொல்லிக்கொடுக்கிறேன் - சேமிப்பு முக்கியம்.',
      quoteEn: "I didn't even have a bank account. Now I teach my grandson - saving is important.",
      avatar: 'SM',
      amount: '₹12,000 saved'
    },
    {
      name: 'Mohammed Ismail',
      role: 'Auto Driver',
      location: 'Hyderabad',
      quote: 'روزانہ ₹15 - میں نے سوچا کہ یہ کچھ نہیں ہے۔ لیکن 2 سال میں ₹15,000 ہو گئے۔ یہ چمتکار ہے!',
      quoteEn: "₹15 daily - I thought it was nothing. But in 2 years it became ₹15,000. This is a miracle!",
      avatar: 'VT',
      amount: '₹15,400 saved'
    },
  ]

  return (
    <section className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-amber-500 font-medium mb-4 tracking-wider">TESTIMONIALS</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            REAL WORKERS.<br />
            <span className="text-gradient">REAL SAVINGS.</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card">
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-8 h-8 text-amber-500/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <p className="text-white leading-relaxed mb-2">{testimonial.quote}</p>
                <p className="text-gray-500 text-sm italic">{testimonial.quoteEn}</p>
              </div>

              {/* Author */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.role}, {testimonial.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-500 font-bold">{testimonial.amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10,000+</p>
              <p className="text-gray-400 text-sm">Workers Enrolled</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">₹4.5 Cr</p>
              <p className="text-gray-400 text-sm">Total Contributions</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">500+</p>
              <p className="text-gray-400 text-sm">Employers Onboard</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}