import React from 'react';
import { cn } from '@almosthack/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'accent' | 'success' | 'warning' | 'destructive' | 'audit';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'sm',
  ...props
}) => {
  const base =
    'inline-flex items-center font-mono rounded-full font-medium tracking-tight border uppercase transition-colors';

  const variants = {
    default: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    outline: 'bg-transparent text-zinc-400 border-zinc-700/80',
    accent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    success: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
    destructive: 'bg-red-950/60 text-red-400 border-red-800/50',
    audit: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/50',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
