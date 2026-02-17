'use client'

import { useState } from 'react'

export default function AIAdvisor() {
  const [activeQuestion, setActiveQuestion] = useState(0)

  const questions = [
    {
      question: "कितना मिलेगा रिटायरमेंट पर?",
      questionEn: "How much will I get at retirement?",
      answer: "Based on your current ₹15/day contribution and 30 years until retirement, you'll have approximately ₹6.8 Lakhs. This gives you a monthly pension of ₹5,200 for 15 years after retirement."
    },
    {
      question: "Can I withdraw in emergency?",
      questionEn: "Can I withdraw in emergency?",
      answer: "Yes! You can withdraw up to 50% of your balance for medical emergencies. We verify the emergency and transfer funds within 2 hours. You can also take a low-interest loan against your pension instead."
    },
    {
      question: "மாதம் எவ்வளவு சேமிக்க வேண்டும்?",
      questionEn: "How much should I save monthly?",
      answer: "For a comfortable retirement of ₹8,000/month pension, I recommend saving ₹25/day (₹750/month). With employer matching, this becomes ₹1,125/month towards your future."
    },
    {
      question: "नौकरी बदलूं तो क्या होगा?",
      questionEn: "What if I change jobs?",
      answer: "Your pension is fully portable! Just share your QR code with your new employer. All your contributions stay in your wallet, and the new employer starts matching immediately. Zero paperwork needed."
    },
  ]

  return (
    <section id="ai-advisor" className="py-24 px-6 bg-gradient-to-b from-gray-900/50 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-amber-500 font-medium mb-4 tracking-wider">AI ADVISOR</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            YOUR PERSONAL<br />
            <span className="text-gradient-gold">RETIREMENT GUIDE</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get personalized advice in Hindi, English, Tamil, Telugu, and 8 more languages.
            Voice-enabled for everyone.
          </p>
        </div>

        {/* AI Chat Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Chat Interface */}
          <div className="order-2 lg:order-1">
            <div className="bg-[#0A0A0A] rounded-3xl border border-white/10 overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center gap-4 p-6 border-b border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">PensionChain AI</h3>
                  <p className="text-green-500 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Online - Ready to help
                  </p>
                </div>
                <button className="ml-auto p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 min-h-[300px]">
                {/* User Question */}
                <div className="flex justify-end">
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-white">{questions[activeQuestion].question}</p>
                    {questions[activeQuestion].question !== questions[activeQuestion].questionEn && (
                      <p className="text-gray-400 text-sm mt-1">{questions[activeQuestion].questionEn}</p>
                    )}
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-gray-300 leading-relaxed">{questions[activeQuestion].answer}</p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <input 
                    type="text" 
                    placeholder="Ask anything about your pension..."
                    className="flex-1 input-dark"
                  />
                  <button className="p-3 rounded-full bg-amber-500 hover:bg-amber-400 transition-colors">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="order-1 lg:order-2 space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">
              Popular Questions
            </h3>
            
            {questions.map((q, index) => (
              <button
                key={index}
                onClick={() => setActiveQuestion(index)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeQuestion === index
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <p className="text-white font-medium">{q.question}</p>
                {q.question !== q.questionEn && (
                  <p className="text-gray-500 text-sm mt-1">{q.questionEn}</p>
                )}
              </button>
            ))}

            <div className="mt-8 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <div>
                  <p className="text-white font-medium">Voice-Enabled</p>
                  <p className="text-gray-400 text-sm">Speak in any of 12 Indian languages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}