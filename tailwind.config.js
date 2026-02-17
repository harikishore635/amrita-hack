/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PensionChain Dark Theme
        background: '#000000',
        foreground: '#FFFFFF',
        card: {
          DEFAULT: '#0A0A0A',
          hover: '#141414',
        },
        border: '#1F1F1F',
        muted: '#888888',
        accent: {
          gold: '#D4AF37',
          orange: '#F59E0B',
          green: '#22C55E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['8rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-lg': ['6rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-md': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-text': 'linear-gradient(135deg, #FFFFFF 0%, #888888 50%, #FFFFFF 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 50%, #D4AF37 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}