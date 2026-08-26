/**
 * AlmostHack Typography Tokens
 * 
 * Target Identity:
 * - Display: Baloo 2 (chunky display typography)
 * - Body: DM Sans (clean, ultra-readable body typography)
 * - Technical / Code: IBM Plex Mono (crisp monospace font)
 */

export const typography = {
  fontFamily: {
    display: ['var(--font-baloo)', 'Baloo 2', 'cursive', 'sans-serif'],
    body: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
    mono: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'Menlo', 'monospace'],
    code: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'Menlo', 'monospace'],
  },

  // Centralized Hierarchy Tokens
  scale: {
    'display-xl': {
      fontSize: '3.5rem', // 56px
      lineHeight: '1.1',
      fontWeight: '800',
      letterSpacing: '-0.03em',
    },
    'display-lg': {
      fontSize: '2.75rem', // 44px
      lineHeight: '1.15',
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    'display-md': {
      fontSize: '2rem', // 32px
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    'heading-xl': {
      fontSize: '1.5rem', // 24px
      lineHeight: '1.3',
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    'heading-lg': {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.35',
      fontWeight: '600',
      letterSpacing: '-0.015em',
    },
    'heading-md': {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.4',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    'body-lg': {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.6',
      fontWeight: '400',
      letterSpacing: '-0.005em',
    },
    'body-md': {
      fontSize: '1rem', // 16px
      lineHeight: '1.5',
      fontWeight: '400',
      letterSpacing: '0',
    },
    'body-sm': {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.45',
      fontWeight: '400',
      letterSpacing: '0',
    },
    label: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1rem',
      fontWeight: '600',
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as const,
    },
    mono: {
      fontSize: '0.8125rem', // 13px
      lineHeight: '1.4',
      fontWeight: '500',
      letterSpacing: '-0.01em',
    },
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export type TypographyTokens = typeof typography;
