/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F0',
        ink: '#1F2937',
        navy: '#1B3A4B',
        navyDark: '#12262F',
        verificato: '#2F6F4E',
        dedotto: '#B8863B',
        assunto: '#8B8A85',
        nonTrovata: '#A6402F',
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
