/**
 * AlmostHack Brand Design Tokens
 * 
 * Target Identity:
 * - Cream/paper canvas (#F7F4EA / #FFFDF8)
 * - AlmostHack deep green (#355C45)
 * - Ink black (#171914)
 * - Restrained pastel accents (yellow, peach, lavender, mint)
 * - Generous whitespace, editorial typography
 */

export const colors = {
  // Brand Green Palette
  brand: {
    DEFAULT: '#355C45',
    dark: '#274535',
    light: '#E2EBDD',
  },

  // Canvas & Surfaces
  surface: {
    cream: '#F7F4EA',
    paper: '#FFFDF8',
    subtle: '#F0ECE1',
    elevated: '#FFFFFF',
  },

  // Typography & Lines
  content: {
    ink: '#171914',
    muted: '#6D7068',
    subtle: '#9A9C94',
    line: '#DCDDD3',
    lineDark: '#274535',
  },

  // Restrained Editorial Accents
  accents: {
    yellow: '#E9E5A8',
    peach: '#F3C9B2',
    lavender: '#DCD5E8',
    mint: '#C9DDD0',
  },

  // Subordinated Semantic Statuses
  semantic: {
    success: {
      bg: '#E2EBDD',
      text: '#274535',
      border: '#B8CEB0',
    },
    warning: {
      bg: '#FAF3D1',
      text: '#785A12',
      border: '#E9E5A8',
    },
    destructive: {
      bg: '#FBE6E3',
      text: '#8B2C24',
      border: '#F3C9B2',
    },
    info: {
      bg: '#EAE6F2',
      text: '#453860',
      border: '#DCD5E8',
    },
  },
} as const;

export type ColorTokens = typeof colors;
