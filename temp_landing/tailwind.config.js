/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#FFFFFF',
        surface: {
          DEFAULT: '#0A0A0A',
          50: '#121212',
          100: '#1A1A1A',
          200: '#262626',
        },
        border: 'rgba(255, 255, 255, 0.12)',
        muted: '#888888',
        cyan: {
          DEFAULT: '#00F0FF',
          glow: 'rgba(0, 240, 255, 0.25)',
        },
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          glow: 'rgba(59, 130, 246, 0.35)',
        },
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'vercel-radial': 'radial-gradient(80% 50% at 50% -20%, rgba(0, 240, 255, 0.15), rgba(0, 0, 0, 0))',
        'cyan-glow': 'radial-gradient(circle at center, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};
