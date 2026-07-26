/**
 * almosthack Color Tokens
 * Monochrome base (black/zinc/white) with a configurable single accent color.
 * Inspired by Vercel, Linear, GitHub, and Raycast.
 */

export const colors = {
  // Pure monochrome spectrum
  black: '#000000',
  white: '#FFFFFF',
  
  zinc: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },

  // Configurable single accent presets
  accents: {
    emerald: {
      light: '#059669',
      DEFAULT: '#10B981',
      dark: '#34D399',
    },
    cyan: {
      light: '#0891B2',
      DEFAULT: '#06B6D4',
      dark: '#22D3EE',
    },
    mono: {
      light: '#18181B',
      DEFAULT: '#FAFAFA',
      dark: '#FFFFFF',
    },
  },

  // Semantic mappings
  semantic: {
    dark: {
      background: '#000000',
      surface: '#09090B',
      surfaceElevated: '#18181B',
      border: '#27272A',
      borderHover: '#3F3F46',
      textPrimary: '#FAFAFA',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      accent: 'var(--almosthack-accent, #10B981)',
    },
    light: {
      background: '#FFFFFF',
      surface: '#FAFAFA',
      surfaceElevated: '#F4F4F5',
      border: '#E4E4E7',
      borderHover: '#D4D4D8',
      textPrimary: '#09090B',
      textSecondary: '#52525B',
      textMuted: '#71717A',
      accent: 'var(--almosthack-accent, #059669)',
    },
  },
} as const;

export type ColorTokens = typeof colors;
