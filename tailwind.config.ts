/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        orange:    { DEFAULT: '#FF6A2B', light: '#FF8A4C' },
        magenta:   { DEFAULT: '#E11D74', deep: '#B01361' },
        plum:      { DEFAULT: '#2A0A22' },
        cream:     { DEFAULT: '#FFF6EF' },
        blush:     { DEFAULT: '#FFE9DD' },
        tangerine: '#FF8A4C',
      },
      fontFamily: {
        serif:  ['Fraunces', 'Georgia', 'serif'],
        sans:   ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
        f:      ['Fraunces', 'serif'],
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)',
        'product':    "url('/product-bg.jpg')",
      },
      boxShadow: {
        soft:  '0 18px 50px -18px rgba(255,106,43,.32), 0 8px 24px -12px rgba(225,29,116,.18)',
        lift:  '0 36px 80px -28px rgba(255,77,109,.45), 0 14px 30px -14px rgba(42,10,34,.22)',
        glass: '0 8px 32px -10px rgba(42,10,34,.18)',
      },
      borderRadius: {
        xl2: '22px',
        xl3: '28px',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(1)' },
          '50%':     { transform: 'scale(1.06)' },
        },
        floatsoft: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slide: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee:   'marquee 38s linear infinite',
        breathe:   'breathe 3.5s ease-in-out infinite',
        floatsoft: 'floatsoft 6s ease-in-out infinite',
        shimmer:   'shimmer 2s linear infinite',
        slide:     'slide 20s linear infinite',
      },
    },
  },
  plugins: [],
};
