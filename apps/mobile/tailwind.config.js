/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1E3A8A',
          red: '#EF4444',
          orange: '#F97316',
          gray: '#64748B',
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        primary: '#1E3A8A', // Navy
        secondary: '#EF4444', // Red
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        mono: ['JetBrainsMono_400Regular'],
      }
    },
  },
  plugins: [],
}
