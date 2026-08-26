import React from 'react';
import { cn } from '@almosthack/utils';
import { Button, ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  'aria-label': string;
  icon: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', icon, 'aria-label': ariaLabel, ...props }, ref) => {
    const squareSizes = {
      sm: 'h-8 w-8 p-0',
      md: 'h-9 w-9 p-0',
      lg: 'h-11 w-11 p-0',
    };

    return (
      <Button
        ref={ref}
        size={size}
        aria-label={ariaLabel}
        className={cn(squareSizes[size], className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
