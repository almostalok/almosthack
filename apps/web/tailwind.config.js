/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/design-system/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Brand Tokens
        'ah-green': '#355C45',
        'ah-green-dark': '#274535',
        'ah-green-light': '#E2EBDD',

        // Surface Tokens
        'ah-cream': '#F7F4EA',
        'ah-paper': '#FFFDF8',
        'ah-subtle': '#F0ECE1',

        // Typography & Lines
        'ah-ink': '#171914',
        'ah-muted': '#6D7068',
        'ah-line': '#DCDDD3',
        'ah-line-dark': '#274535',

        // Pastel Accents
        'ah-yellow': '#E9E5A8',
        'ah-peach': '#F3C9B2',
        'ah-lavender': '#DCD5E8',
        'ah-mint': '#C9DDD0',

        // Compatible semantic bindings
        border: '#DCDDD3',
        input: '#DCDDD3',
        ring: '#355C45',
        background: '#F7F4EA',
        foreground: '#171914',
        primary: {
          DEFAULT: '#355C45',
          foreground: '#FFFDF8',
        },
        secondary: {
          DEFAULT: '#E2EBDD',
          foreground: '#274535',
        },
        muted: {
          DEFAULT: '#F7F4EA',
          foreground: '#6D7068',
        },
        accent: {
          DEFAULT: '#355C45',
          foreground: '#FFFDF8',
        },
        card: {
          DEFAULT: '#FFFDF8',
          foreground: '#171914',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(23, 25, 20, 0.03)',
        xs: '0 1px 3px 0 rgba(23, 25, 20, 0.04)',
        sm: '0 2px 6px 0 rgba(23, 25, 20, 0.05)',
        elevated: '0 8px 20px -4px rgba(23, 25, 20, 0.08), 0 4px 8px -2px rgba(23, 25, 20, 0.04)',
        modal: '0 20px 40px -8px rgba(23, 25, 20, 0.12), 0 8px 16px -4px rgba(23, 25, 20, 0.06)',
      },
      fontFamily: {
        display: ['var(--font-baloo)', 'Baloo 2', 'cursive', 'sans-serif'],
        heading: ['var(--font-baloo)', 'Baloo 2', 'cursive', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'monospace'],
        code: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
