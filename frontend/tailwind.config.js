/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ioai-green': '#00A651',
        'ioai-green-light': '#E6F7F5',
        'ioai-blue': '#003087',
        'ioai-blue-light': '#EBF2FF',
        'ioai-dark-blue': '#003087',
        'benin-yellow': '#FCD116',
        'benin-red': '#E30613',
        'off-white': '#f8f9fc',
        'off-white-warm': '#f5f6fa',
        'off-white-cool': '#f0f2f8',
        'surface': '#eef0f7',
        // Text colors
        'text-primary': '#003087',
        'text-secondary': '#555555',
        'text-tertiary': '#888888',
        'watermark-gray': 'rgba(0, 0, 0, 0.07)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-montserrat)', 'sans-serif'],
      },
      backgroundImage: {
        'circuit-pattern': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 L30 10 L30 30' fill='none' stroke='%233366CC' stroke-width='0.5' opacity='0.1'/%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%233366CC' opacity='0.15'/%3E%3Cpath d='M70 90 L70 70 L90 70' fill='none' stroke='%2300A896' stroke-width='0.5' opacity='0.1'/%3E%3Ccircle cx='90' cy='70' r='1.5' fill='%2300A896' opacity='0.15'/%3E%3Cpath d='M40 40 L60 60' fill='none' stroke='%232E4A8B' stroke-width='0.5' opacity='0.08' stroke-dasharray='2 2'/%3E%3C/svg%3E\")",
        'afro-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='%23FFB800' stroke-width='0.5' opacity='0.08'/%3E%3Cpath d='M30 10 L50 30 L30 50 L10 30 Z' fill='none' stroke='%2300A896' stroke-width='0.5' opacity='0.05'/%3E%3Ccircle cx='30' cy='30' r='2' fill='%232E4A8B' opacity='0.1'/%3E%3C/svg%3E\")",
        'code-pattern': "url(\"data:image/svg+xml,%3Csvg width='200' height='100' viewBox='0 0 200 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='20' font-family='monospace' font-size='10' fill='%232E4A8B' opacity='0.05'%3Edef ai_model(x):%3C/text%3E%3Ctext x='30' y='40' font-family='monospace' font-size='10' fill='%2300A896' opacity='0.05'%3Ereturn x * w + b%3C/text%3E%3Ctext x='10' y='70' font-family='monospace' font-size='10' fill='%233366CC' opacity='0.05'%3E%7B 'loss': 0.01 %7D%3C/text%3E%3C/svg%3E\")",
        'topo-pattern': "url(\"data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 200 Q 100 100 200 200 T 400 200' fill='none' stroke='%2300A896' stroke-width='0.8' opacity='0.06'/%3E%3Cpath d='M0 220 Q 100 120 200 220 T 400 220' fill='none' stroke='%233366CC' stroke-width='0.8' opacity='0.06'/%3E%3Cpath d='M0 180 Q 100 80 200 180 T 400 180' fill='none' stroke='%232E4A8B' stroke-width='0.8' opacity='0.06'/%3E%3C/svg%3E\")",
        'binary-pattern': "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='16' fill='%23000000' opacity='0.07'%3E01010%3C/text%3E%3Ctext x='50' y='60' font-family='monospace' font-size='16' fill='%23000000' opacity='0.07'%3E10101%3C/text%3E%3Ctext x='20' y='90' font-family='monospace' font-size='16' fill='%23000000' opacity='0.07'%3E01010%3C/text%3E%3Ctext x='60' y='120' font-family='monospace' font-size='16' fill='%23000000' opacity='0.07'%3E10101%3C/text%3E%3C/svg%3E\")",
        'neural-pattern': "url(\"data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='node'%3E%3Cstop offset='0%25' stop-color='%2300A896' stop-opacity='0.3'/%3E%3Cstop offset='100%25' stop-color='%2300A896' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='4' fill='%2300A896' opacity='0.2'/%3E%3Ccircle cx='150' cy='50' r='4' fill='%233366CC' opacity='0.2'/%3E%3Ccircle cx='50' cy='150' r='4' fill='%232E4A8B' opacity='0.2'/%3E%3Ccircle cx='150' cy='150' r='4' fill='%2300A896' opacity='0.2'/%3E%3Cline x1='50' y1='50' x2='150' y2='50' stroke='%2300A896' stroke-width='0.5' opacity='0.1'/%3E%3Cline x1='50' y1='50' x2='50' y2='150' stroke='%233366CC' stroke-width='0.5' opacity='0.1'/%3E%3Cline x1='150' y1='50' x2='150' y2='150' stroke='%232E4A8B' stroke-width='0.5' opacity='0.1'/%3E%3Cline x1='50' y1='150' x2='150' y2='150' stroke='%2300A896' stroke-width='0.5' opacity='0.1'/%3E%3Cline x1='50' y1='50' x2='150' y2='150' stroke='%233366CC' stroke-width='0.3' opacity='0.08' stroke-dasharray='2 2'/%3E%3Cline x1='150' y1='50' x2='50' y2='150' stroke='%232E4A8B' stroke-width='0.3' opacity='0.08' stroke-dasharray='2 2'/%3E%3C/svg%3E\")",
        'ai-mesh': "url(\"data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='smallGrid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%2300A896' stroke-width='0.3' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23smallGrid)'/%3E%3Cpath d='M50 50 Q 150 100 250 50' fill='none' stroke='%233366CC' stroke-width='1' opacity='0.15'/%3E%3Cpath d='M50 150 Q 150 200 250 150' fill='none' stroke='%2300A896' stroke-width='1' opacity='0.15'/%3E%3Cpath d='M50 250 Q 150 200 250 250' fill='none' stroke='%232E4A8B' stroke-width='1' opacity='0.15'/%3E%3C/svg%3E\")",
        'gradient-mesh': "url(\"data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2300A896;stop-opacity:0.1' /%3E%3Cstop offset='100%25' style='stop-color:%233366CC;stop-opacity:0.1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M0,200 Q100,100 200,200 T400,200' fill='none' stroke='url(%23grad1)' stroke-width='40' opacity='0.3'/%3E%3Cpath d='M0,250 Q100,150 200,250 T400,250' fill='none' stroke='%2300A896' stroke-width='2' opacity='0.1'/%3E%3Cpath d='M0,150 Q100,50 200,150 T400,150' fill='none' stroke='%233366CC' stroke-width='2' opacity='0.1'/%3E%3C/svg%3E\")"
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-down': 'fadeInDown 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse': 'spinReverse 25s linear infinite',
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 168, 150, 0.15), 0 0 60px rgba(0, 168, 150, 0.05)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 168, 150, 0.25), 0 0 80px rgba(0, 168, 150, 0.1)' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 168, 150, 0.15), 0 0 60px rgba(0, 168, 150, 0.05)',
        'glow-blue': '0 0 20px rgba(51, 102, 204, 0.15), 0 0 60px rgba(51, 102, 204, 0.05)',
        'soft': '0 2px 20px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 40px rgba(0, 0, 0, 0.06)',
        'float': '0 20px 40px rgba(0, 0, 0, 0.06), 0 0 30px rgba(0, 168, 150, 0.08)',
      }
    }
  },
  plugins: [],
}
