/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cin: {
          bg: '#06060f', surface: '#0e0e1c', card: '#13131f',
          red: '#e50914', gold: '#d4a843', blue: '#0ea5e9',
          purple: '#8b5cf6', green: '#10b981', muted: '#64648a',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    }
  },
  plugins: [],
}
