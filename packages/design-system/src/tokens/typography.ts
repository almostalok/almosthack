/**
 * almosthack Typography Tokens
 * Technical, bold headings with subtle brutalist personality.
 * High contrast, ultra-readable body font.
 */

export const typography = {
  fontFamily: {
    heading: ['Geist', 'Space Grotesk', 'General Sans', 'system-ui', 'sans-serif'],
    body: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
    code: ['JetBrains Mono', 'Geist Mono', 'Menlo', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '-0.01em' }],
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.015em' }],
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.02em' }],
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.02em' }],
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.03em' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.035em' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.04em' }],
    '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.045em' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
} as const;

export type TypographyTokens = typeof typography;
