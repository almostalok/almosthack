/**
 * AlmostHack Spacing & Radius Tokens
 * 
 * 8px Spacing Foundation:
 * 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 120, 160
 * 
 * Radius:
 * sm: 8px
 * md: 14px
 * lg: 20px
 */

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  30: '120px',
  40: '160px',
} as const;

export const radius = {
  none: '0px',
  sm: '8px',
  md: '14px',
  lg: '20px',
  full: '9999px',
} as const;

export const borders = {
  default: '1px solid #DCDDD3',
  emphasis: '1px solid #274535',
  subtle: '1px solid #ECEEE5',
  dashed: '1px dashed #DCDDD3',
} as const;

export const shadows = {
  none: 'none',
  // Restrained paper shadows
  subtle: '0 1px 2px 0 rgba(23, 25, 20, 0.04)',
  paper: '0 2px 6px 0 rgba(23, 25, 20, 0.05), 0 1px 2px -1px rgba(23, 25, 20, 0.05)',
  elevated: '0 8px 20px -4px rgba(23, 25, 20, 0.08), 0 4px 8px -2px rgba(23, 25, 20, 0.04)',
  modal: '0 20px 40px -8px rgba(23, 25, 20, 0.12), 0 8px 16px -4px rgba(23, 25, 20, 0.06)',
} as const;

export type SpacingTokens = typeof spacing;
export type RadiusTokens = typeof radius;
export type BorderTokens = typeof borders;
export type ShadowTokens = typeof shadows;
