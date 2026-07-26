/**
 * almosthack Animation Tokens
 * Fast, subtle transitions (150ms-250ms). No bounce or exaggerated easing.
 * Inspired by Linear and Raycast interface feel.
 */

export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '250ms',
  },
  easing: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth subtle decelerate
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
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -4 },
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    },
    scaleUp: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
      transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
    },
  },
} as const;
