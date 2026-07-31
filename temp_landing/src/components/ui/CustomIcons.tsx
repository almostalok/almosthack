'use client';

import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

/* Custom Animated HeyClicky Logo Face */
export function IconClickyFace({ size = 28, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={(size * 31) / 48}
      viewBox="0 0 48 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-300 group-hover:scale-105 ${className}`}
      {...props}
    >
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path className="clicky-logo-mouth" d="M24.3 23.3 L33.4 23.3" stroke="#00F0FF" />
        <path className="clicky-logo-zig" d="M9.5 12.4 L14.5 6.5 L24.3 23.3" />
        <path className="clicky-logo-eye" d="M27.1 12.4 L32.86 6.5 L38.4 12.4" />
      </g>
    </svg>
  );
}

/* Custom Lightning Zap Flash Icon */
export function IconZapFlash({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" opacity="0.2" />
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

/* Custom Apple Vintage Macintosh Finder Icon */
export function IconAppleMac({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 170 170"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.09-3.26-2.64-7.14-7.24-11.66-13.82-7.16-10.42-12.82-22.18-16.98-35.29-4.16-13.11-6.24-25.7-6.24-37.78 0-14.86 3.69-27.13 11.07-36.81 7.39-9.68 16.74-14.65 28.06-14.9 4.34 0 9.4 1.15 15.18 3.44 5.78 2.3 9.77 3.44 11.97 3.44 1.94 0 6.04-1.2 12.31-3.61 6.27-2.4 11.37-3.48 15.31-3.23 12.08.76 21.68 5.25 28.8 13.48-10.73 6.49-16.01 15.54-15.83 27.15.25 9.17 3.86 16.8 10.83 22.89 6.97 6.09 15.22 9.53 24.75 10.33-2.58 7.57-6.07 15.54-10.48 23.91zM119.22 31.07c0-7.18 2.6-14.11 7.8-20.78 5.2-6.68 11.8-10.79 19.8-12.33.25.99.38 1.98.38 2.97 0 7.31-2.65 14.31-7.95 21-5.3 6.69-11.89 10.72-19.78 12.09-.07-.98-.25-1.97-.25-2.95z"/>
    </svg>
  );
}

/* Custom Windows OS Logo Icon */
export function IconWindowsOS({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M0 12.402l35.687-4.858v34.717H0V12.402zm0 63.196l35.687 4.859V45.739H0v29.859zm39.544 5.378L88 88V45.739H39.544v35.237zm0-71.952V42.26H88V0L39.544 8.956z"/>
    </svg>
  );
}

/* Custom CPU Chip Icon */
export function IconCpuChip({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" fill="rgba(0,240,255,0.1)" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="15" x2="23" y2="15" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="15" x2="4" y2="15" />
    </svg>
  );
}

/* Custom Trophy Award Icon */
export function IconTrophy({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="rgba(245,158,11,0.15)" />
    </svg>
  );
}

/* Custom Shield Cryptographic Verifier Icon */
export function IconShieldCert({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(139,92,246,0.15)" />
      <path d="m9 12 2 2 4-4" strokeWidth="2.5" />
    </svg>
  );
}

/* Custom Sparkle Magic Icon */
export function IconSparkle({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

/* Custom Terminal Prompt Icon */
export function IconTerminalCode({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </svg>
  );
}

/* Custom Verified Badge Icon */
export function IconVerifiedCheck({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
    </svg>
  );
}

/* Custom Arrow Right Icon */
export function IconArrowRight({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* Custom Checkmark Circle Icon */
export function IconCheckCircle({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
