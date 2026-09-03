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
        // Dark Theme Specification Tokens
        'dark-bg': '#0B0D0C',
        'dark-surface': '#111412',
        'dark-elevated': '#151917',
        'dark-card': '#111412',
        'dark-border': 'rgba(255,255,255,0.10)',
        'dark-border-subtle': 'rgba(255,255,255,0.06)',
        'dark-text-primary': '#F5F7F4',
        'dark-text-secondary': '#A7AEA7',
        'dark-text-muted': '#737A73',
        
        // AlmostHack Brand Greens
        'ah-green-brand': '#028051',
        'ah-action-green': '#A8E63B',
        'ah-green': '#028051',
        'ah-green-dark': '#015c3a',
        'ah-green-light': '#A8E63B',

        // Legacy Surface Tokens
        'ah-cream': '#F7F4EA',
        'ah-paper': '#FFFDF8',
        'ah-subtle': '#F0ECE1',
        'ah-ink': '#171914',
        'ah-muted': '#6D7068',
        'ah-line': '#DCDDD3',
        'ah-line-dark': '#274535',

        // Compatible semantic bindings
        border: 'rgba(255,255,255,0.10)',
        input: 'rgba(255,255,255,0.10)',
        ring: '#028051',
        background: '#0B0D0C',
        foreground: '#F5F7F4',
        primary: {
          DEFAULT: '#028051',
          foreground: '#F5F7F4',
        },
        secondary: {
          DEFAULT: '#111412',
          foreground: '#F5F7F4',
        },
        muted: {
          DEFAULT: '#151917',
          foreground: '#A7AEA7',
        },
        accent: {
          DEFAULT: '#A8E63B',
          foreground: '#0B0D0C',
        },
        card: {
          DEFAULT: '#111412',
          foreground: '#F5F7F4',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        xs: '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        sm: '0 2px 6px 0 rgba(0, 0, 0, 0.6)',
        elevated: '0 8px 24px -4px rgba(0, 0, 0, 0.7), 0 4px 12px -2px rgba(0, 0, 0, 0.5)',
        modal: '0 24px 48px -8px rgba(0, 0, 0, 0.8), 0 8px 20px -4px rgba(0, 0, 0, 0.6)',
        'glow-green': '0 0 25px -5px rgba(168, 230, 59, 0.25)',
        'glow-green-sm': '0 0 15px -3px rgba(168, 230, 59, 0.2)',
      },
      fontFamily: {
        display: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        heading: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'monospace'],
        code: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'monospace'],
        baloo: ['var(--font-baloo)', 'Baloo 2', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
