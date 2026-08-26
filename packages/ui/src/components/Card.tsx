import React from 'react';
import { cn } from '@almosthack/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: 'default' | 'editorial' | 'accent' | 'flat';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hoverable = false, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs',
      editorial: 'bg-[#FFFDF8] border border-[#DCDDD3] border-t-2 border-t-[#355C45] shadow-xs',
      accent: 'bg-[#F7F4EA] border border-[#DCDDD3] shadow-xs',
      flat: 'bg-[#FFFDF8] border border-[#DCDDD3]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[14px] p-6 text-[#171914] transition-all duration-150',
          variants[variant],
          hoverable && 'hover:border-[#355C45]/60 hover:shadow-sm cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex flex-col gap-1 mb-4 text-left', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-lg font-bold tracking-tight text-[#171914] font-heading', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-[#6D7068] font-body', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('w-full text-left', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex items-center pt-4 mt-4 border-t border-[#DCDDD3]/70 text-xs font-mono', className)} {...props}>
    {children}
  </div>
);
