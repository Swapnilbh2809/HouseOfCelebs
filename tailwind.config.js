/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'marquee-red': '#D32F2F',
        'vintage-cream': '#F5E6D3',
        'deep-charcoal': '#1a1a1a',
        'gold': '#FFD700',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
