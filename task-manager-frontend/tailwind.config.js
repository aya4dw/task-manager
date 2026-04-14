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
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        priority: {
          low: '#10b981',    // green
          medium: '#f59e0b', // amber
          high: '#f97316',   // orange
          urgent: '#ef4444', // red
        }
      }
    },
  },
  plugins: [],
}
