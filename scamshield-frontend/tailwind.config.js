/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B1220',
        card: '#151E2D',
        card2: '#1B2637',
        accent: {
          DEFAULT: '#57E3D5',
          dim: '#2E9C92',
          soft: 'rgba(87,227,213,0.12)',
        },
        safe: {
          DEFAULT: '#22C55E',
          soft: 'rgba(34,197,94,0.12)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          soft: 'rgba(245,158,11,0.12)',
        },
        danger: {
          DEFAULT: '#EF4444',
          soft: 'rgba(239,68,68,0.12)',
        },
        muted: '#8B98AC',
        line: 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(87,227,213,0.15), 0 8px 30px -8px rgba(87,227,213,0.25)',
        card: '0 4px 24px -8px rgba(0,0,0,0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        blip: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        sweep: 'sweep 3s linear infinite',
        pulseRing: 'pulseRing 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        blip: 'blip 2s ease-in-out infinite',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
