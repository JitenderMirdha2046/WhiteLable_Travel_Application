/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50, #eff6ff)',
          100: 'var(--color-primary-100, #dbeafe)',
          200: 'var(--color-primary-200, #bfdbfe)',
          300: 'var(--color-primary-300, #93c5fd)',
          400: 'var(--color-primary)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary-dark)',
          700: 'var(--color-primary-700, #1d4ed8)',
          800: 'var(--color-primary-800, #1e3a5f)',
          900: 'var(--color-primary-900, #0f1b2d)',
          950: 'var(--color-primary-950, #070d1a)',
        },
        accent: {
          50: 'var(--color-accent-50, #fdf8f0)',
          100: 'var(--color-accent-100, #f9edcf)',
          200: 'var(--color-accent-200, #f2d99e)',
          300: 'var(--color-accent-300, #ebc56d)',
          400: 'var(--color-accent)',
          500: 'var(--color-accent)',
          600: 'var(--color-accent-dark, #b17d09)',
          700: 'var(--color-accent-700, #855e07)',
          800: 'var(--color-accent-800, #593f04)',
          900: 'var(--color-accent-900, #2c1f02)',
        },
        surface: {
          DEFAULT: '#0a0f1e',
          light: '#111827',
          lighter: '#1a2332',
          border: '#1e293b',
          'border-light': '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Clash Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-lg': 'glow-lg 3s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-up-lg': 'slideUp 0.7s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)' },
        },
        'glow-lg': {
          '0%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.1), 0 0 80px rgba(168, 85, 247, 0.05)' },
          '100%': { boxShadow: '0 0 60px rgba(59, 130, 246, 0.2), 0 0 120px rgba(168, 85, 247, 0.1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
