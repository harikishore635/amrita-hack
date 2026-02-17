'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { aiAPI } from '@/lib/api'

interface Message {
  id: number
  type: 'user' | 'ai'
  content: string
  timestamp: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: 'नमस्ते! मैं आपका पेंशन सलाहकार हूं। मैं आपकी रिटायरमेंट प्लानिंग में मदद कर सकता हूं।',
      timestamp: '—',
    },
    {
      id: 2,
      type: 'ai',
      content: "Hello! I'm your PensionChain AI advisor. I can help you with retirement planning, contribution advice, emergency withdrawals, and more. Ask me anything!",
      timestamp: '—',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const languages = [
    { code: 'hi', name: 'हिंदी' },
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
  ]

  const quickQuestions = [
    { text: 'How much will I get at retirement?', translation: 'How much will I get at retirement?' },
    { text: 'Can I withdraw early?', translation: 'Can I withdraw early?' },
    { text: 'How is my money invested?', translation: 'How is my money invested?' },
    { text: 'What if I change jobs?', translation: 'What if I change jobs?' },
    { text: 'Increase my contribution advice', translation: 'Increase my contribution advice' },
  ]

  const handleSend = async (messageText?: string) => {
    const text = messageText || inputValue
    if (!text.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await aiAPI.chat(text, selectedLanguage)

      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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
                  {isLoading ? 'Thinking...' : 'Online · Powered by Gemini'}
                </p>
              </div>
            </div>
          </div>

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
              {message.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-sm">🤖</span>
                </div>
              )}
              <div className={`max-w-[80%]`}>
                <div
                  className={`rounded-2xl px-5 py-4 ${message.type === 'user'
                    ? 'bg-amber-500/20 border border-amber-500/30 rounded-tr-sm'
                    : 'bg-white/5 border border-white/10 rounded-tl-sm'
                    }`}
                >
                  <p className="text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className={`text-gray-500 text-xs mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div className="rounded-2xl px-5 py-4 bg-white/5 border border-white/10 rounded-tl-sm">
                <div className="flex gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
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
                onClick={() => handleSend(q.text)}
                disabled={isLoading}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
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
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Ask about your pension, retirement, investments..."
                className="w-full input-dark pr-12"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="p-4 rounded-full bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}