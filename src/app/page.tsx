import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Stats from '@/components/Stats'
import Pricing from '@/components/Pricing'
import AIAdvisor from '@/components/AIAdvisor'
import Testimonials from '@/components/Testimonials'
import Marquee from '@/components/Marquee'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <Stats />
      <AIAdvisor />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}