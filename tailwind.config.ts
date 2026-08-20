import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F6F1E7',
        paper: '#FBF8F2',
        ink: '#241F19',
        forest: {
          DEFAULT: '#3E4A37',
          light: '#5C6B52',
          dark: '#28311F',
        },
        clay: {
          DEFAULT: '#B9704A',
          light: '#D69169',
          dark: '#8F5636',
        },
        sand: '#E6DAC3',
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
