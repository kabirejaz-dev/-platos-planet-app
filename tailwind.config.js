/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Plato Design System
        electric: { blue: '#4D7CFF', DEFAULT: '#4D7CFF' },
        neo: { purple: '#7B61FF', DEFAULT: '#7B61FF' },
        fluorescent: { cyan: '#00F0FF', DEFAULT: '#00F0FF' },
        neon: { mint: '#00FFA3', DEFAULT: '#00FFA3' },
        electric2: { lime: '#C6FF00', DEFAULT: '#C6FF00' },
        coral: { DEFAULT: '#FF6B7A' },
        // Base
        dark: { DEFAULT: '#0A0E1A', card: '#111827', border: '#1E2940' },
        // Shadcn
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-ai': 'linear-gradient(135deg, #4D7CFF 0%, #7B61FF 50%, #00F0FF 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0A0E1A 0%, #111827 100%)',
        'gradient-success': 'linear-gradient(135deg, #00FFA3 0%, #00F0FF 100%)',
        'gradient-warning': 'linear-gradient(135deg, #FF6B7A 0%, #FF9B6B 100%)',
        'gradient-achievement': 'linear-gradient(135deg, #C6FF00 0%, #00FFA3 100%)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(77, 124, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(123, 97, 255, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.3)',
        'glow-mint': '0 0 20px rgba(0, 255, 163, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
