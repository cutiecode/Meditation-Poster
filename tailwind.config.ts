import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#F0DFA0',
          dark: '#8A6A1F',
        },
        cream: {
          DEFAULT: '#FAF8F3',
          2: '#F3EFE6',
        },
        ink: {
          DEFAULT: '#1A1612',
          soft: '#4A4440',
          muted: '#8A827A',
        },
      },
    },
  },
  plugins: [],
}

export default config