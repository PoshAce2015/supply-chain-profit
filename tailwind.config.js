/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Standardized design system colors
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Standardized button colors
        button: {
          primary: 'rgb(37, 99, 235)',
          secondary: 'rgba(0, 0, 0, 0)',
          success: 'rgb(22, 163, 74)',
          danger: 'rgb(220, 38, 38)',
          neutral: 'rgb(75, 85, 99)',
        },
        // Badge colors for margins
        margin: {
          green: '#10b981', // ≥10%
          yellow: '#f59e0b', // 5-<10%
          red: '#ef4444', // <0%
          thin: '#8b5cf6', // 0-5%
          gray: '#6b7280', // insufficient data
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
