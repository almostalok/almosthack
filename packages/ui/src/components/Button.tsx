import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@almosthack/utils';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'danger' | 'outline' | 'link' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C45] focus-visible:ring-offset-1 focus-visible:ring-offset-[#F7F4EA] disabled:opacity-45 disabled:pointer-events-none rounded-[10px] tracking-tight select-none cursor-pointer';

    const normalizedVariant = variant === 'danger' ? 'destructive' : variant;

    const variants: Record<string, string> = {
      primary:
        'bg-[#355C45] text-[#FFFDF8] hover:bg-[#274535] active:bg-[#1E3629] border border-[#274535] shadow-sm',
      secondary:
        'bg-[#FFFDF8] text-[#355C45] hover:bg-[#F7F4EA] active:bg-[#ECEEE5] border border-[#DCDDD3] shadow-xs',
      outline:
        'bg-transparent text-[#171914] hover:bg-[#F7F4EA] border border-[#DCDDD3]',
      ghost:
        'bg-transparent text-[#171914] hover:bg-[#F7F4EA] hover:text-[#274535] border border-transparent',
      destructive:
        'bg-[#FBE6E3] text-[#8B2C24] hover:bg-[#F6D0CB] active:bg-[#F0B8B1] border border-[#F3C9B2]',
      accent:
        'bg-[#E2EBDD] text-[#274535] hover:bg-[#D4E3CC] active:bg-[#C5D9BB] border border-[#B8CEB0]',
      link:
        'bg-transparent text-[#355C45] hover:underline underline-offset-4 p-0 h-auto font-medium border-0',
    };

    const sizes = {
      sm: 'min-h-[32px] px-3 text-xs gap-1.5',
      md: 'min-h-[38px] px-4 text-sm gap-2',
      lg: 'min-h-[44px] px-5 text-base gap-2.5 rounded-[12px]',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? true : undefined}
        className={cn(baseStyles, variants[normalizedVariant] || variants.primary, sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span
            className="animate-spin mr-1.5 h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"
            aria-hidden="true"
          />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
