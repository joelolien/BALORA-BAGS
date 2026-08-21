import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF0F2',
        paper: '#FEF9FA',
        ink: '#251F23',
        forest: {
          DEFAULT: '#8B6B80',
          light: '#A8869C',
          dark: '#57414F',
        },
        clay: {
          DEFAULT: '#B97690',
          light: '#D6A0B3',
          dark: '#8F5169',
        },
        sand: '#F0DCE1',
        gold: '#AC8A50',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      maxWidth: {
        '8xl': '90rem',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
