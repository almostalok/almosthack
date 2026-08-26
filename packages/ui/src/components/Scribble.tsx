import React from 'react';
import { cn } from '@almosthack/utils';

export interface ScribbleProps extends React.SVGAttributes<SVGElement> {
  variant?: 'underline' | 'circle' | 'sparkle' | 'arrow' | 'highlight' | 'box' | 'asterisk';
  color?: string;
  className?: string;
}

export const Scribble: React.FC<ScribbleProps> = ({
  variant = 'underline',
  color = 'currentColor',
  className,
  ...props
}) => {
  switch (variant) {
    case 'underline':
      return (
        <svg
          viewBox="0 0 100 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('w-24 h-3 text-[#355C45]', className)}
          {...props}
        >
          <path
            d="M2 7.5C24.5 3 61.5 2 98 8.5C72 6 41 6.5 12 10"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'circle':
      return (
        <svg
          viewBox="0 0 120 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('w-28 h-14 text-[#355C45]', className)}
          {...props}
        >
          <path
            d="M10 32C8 16 35 6 62 6C94 6 114 18 112 34C110 49 84 55 52 54C24 53 4 44 8 28"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'sparkle':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('w-6 h-6 text-[#E9E5A8]', className)}
          {...props}
        >
          <path
            d="M12 2C12.5 7 17 11.5 22 12C17 12.5 12.5 17 12 22C11.5 17 7 12.5 2 12C7 11.5 11.5 7 12 2Z"
            fill={color}
          />
        </svg>
      );

    case 'arrow':
      return (
        <svg
          viewBox="0 0 60 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('w-12 h-8 text-[#355C45]', className)}
          {...props}
        >
          <path
            d="M4 28C18 22 36 14 52 12M52 12L42 6M52 12L44 22"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'highlight':
      return (
        <svg
          viewBox="0 0 100 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('w-28 h-5 text-[#E9E5A8]/70', className)}
          {...props}
        >
          <path
            d="M2 12C28 7 68 5 98 10C70 14 34 16 4 18"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      );

    case 'box':
      return (
        <svg
          viewBox="0 0 80 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('w-20 h-10 text-[#355C45]', className)}
          {...props}
        >
          <rect
            x="3"
            y="3"
            width="74"
            height="34"
            rx="8"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        </svg>
      );

    case 'asterisk':
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('w-5 h-5 text-[#F3C9B2]', className)}
          {...props}
        >
          <path
            d="M10 2V18M3 6L17 14M3 14L17 6"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
};
