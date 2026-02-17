'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Message {
  id: number
  type: 'user' | 'ai'
  content: string
  timestamp: string
  language?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: 'नमस्ते! मैं आपका पेंशन सलाहकार हूं। मैं आपकी रिटायरमेंट प्लानिंग में मदद कर सकता हूं। आप हिंदी, English या किसी भी भाषा में पूछ सकते हैं।',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      type: 'ai',
      content: "Hello! I'm your pension advisor. I can help you with retirement planning. Feel free to ask in Hindi, English, or any language!",
      timestamp: '10:30 AM',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('hi')

  const languages = [
    { code: 'hi', name: 'हिंदी' },
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
  ]

  const quickQuestions = [
    { text: 'कितना मिलेगा रिटायरमेंट पर?', translation: 'How much will I get at retirement?' },
    { text: 'Can I withdraw early?', translation: 'Can I withdraw early?' },
    { text: 'How is my money invested?', translation: 'How is my money invested?' },
    { text: 'नौकरी बदलूं तो?', translation: 'What if I change jobs?' },
  ]

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages([...messages, newMessage])
    setInputValue('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: "Based on your current contribution of ₹15/day and 24 years until retirement, you're projected to have approximately ₹6.8 Lakhs. This translates to a monthly pension of ₹5,200 for 15 years. You're on a great track! Would you like me to explain how increasing your contribution could boost this amount?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1500)
  }

  const handleQuickQuestion = (question: string) => {
    setInputValue(question)
    handleSend()
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-white font-semibold">PensionChain AI</h1>
                <p className="text-green-500 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
          </div>
          
          {/* Language Selector */}
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="input-dark w-36"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                <div
                  className={`rounded-2xl px-5 py-4 ${
                    message.type === 'user'
                      ? 'bg-amber-500/20 border border-amber-500/30 rounded-tr-sm'
                      : 'bg-white/5 border border-white/10 rounded-tl-sm'
                  }`}
                >
                  <p className="text-white leading-relaxed">{message.content}</p>
                </div>
                <p className={`text-gray-500 text-xs mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  {message.timestamp}
                </p>
              </div>
              {message.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-sm">🤖</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Questions */}
      <div className="flex-shrink-0 border-t border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500 text-sm mb-3">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(q.text)}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 hover:border-white/20 transition-all"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-white/5 px-6 py-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Voice Button */}
            <button
              onClick={() => setIsListening(!isListening)}
              className={`p-4 rounded-full transition-all ${
                isListening
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {isListening ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question or tap mic to speak..."
                className="w-full input-dark pr-12"
              />
              {isListening && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                  <span className="w-1 h-4 bg-amber-500 rounded-full animate-pulse" />
                  <span className="w-1 h-6 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 h-3 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 h-5 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-4 rounded-full bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Voice Animation Indicator */}
          {isListening && (
            <div className="mt-4 text-center">
              <p className="text-amber-500 text-sm animate-pulse">
                <svg className="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Listening... Speak in {languages.find(l => l.code === selectedLanguage)?.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}