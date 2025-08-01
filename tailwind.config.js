/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'retention-high': '#22c55e',
        'retention-medium': '#eab308',
        'retention-low': '#ef4444',
        'retention-none': '#f3f4f6'
      }
    },
  },
  plugins: [],
}