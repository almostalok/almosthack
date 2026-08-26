/**
 * AlmostHack Animation Tokens
 * 
 * Subtle, purposeful transitions without exaggerated bouncy SaaS effects.
 */

export const animations = {
  duration: {
    fast: '120ms',
    normal: '180ms',
    slow: '240ms',
  },
  easing: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth paper transition
    linear: 'linear',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  motionVariants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
    },
    slideUp: {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -4 },
      transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
    },
    modal: {
      initial: { opacity: 0, scale: 0.98, y: 8 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.98, y: 6 },
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    },
  },
} as const;

export type AnimationTokens = typeof animations;
