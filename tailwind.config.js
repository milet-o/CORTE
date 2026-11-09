/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1d1714',
        paper: '#f0ece5',
        card: '#fffdf8',
        cream: '#f6ece2',
        creme: '#fff4dc',
        or: {
          DEFAULT: '#e8673a',
          dark: '#d4562a',
        },
        mu: {
          DEFAULT: '#f2b84b',
          dark: '#d99e2e',
        },
        gr: {
          DEFAULT: '#3e9b6f',
          dark: '#2b7552',
        },
        bl: {
          DEFAULT: '#4f7fd0',
          dark: '#3d6ab8',
        },
        rd: {
          DEFAULT: '#e0463a',
          dark: '#c73328',
        },
        suave: '#4d433d',
      },
      boxShadow: {
        'solid-sm': '2px 2px 0 #1d1714',
        'solid': '4px 4px 0 #1d1714',
        'solid-lg': '6px 6px 0 #1d1714',
        'solid-xl': '8px 8px 0 #1d1714',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}