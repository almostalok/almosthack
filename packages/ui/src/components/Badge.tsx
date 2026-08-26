import React from 'react';
import { cn } from '@almosthack/utils';

export type BadgeVariant =
  | 'default'
  | 'outline'
  | 'accent'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'audit'
  | 'yellow'
  | 'peach'
  | 'lavender'
  | 'mint'
  | 'OPEN'
  | 'LIVE'
  | 'JUDGING'
  | 'COMPLETED'
  | 'REGISTERED'
  | 'SUBMITTED'
  | 'PENDING'
  | 'APPROVED'
  | 'LOCKED'
  | 'EDITABLE';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'sm',
  dot = false,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-mono rounded-[6px] font-semibold tracking-tight border uppercase transition-colors select-none';

  const variants: Record<string, string> = {
    default: 'bg-[#F7F4EA] text-[#6D7068] border-[#DCDDD3]',
    outline: 'bg-transparent text-[#6D7068] border-[#DCDDD3]',
    accent: 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]',
    success: 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]',
    warning: 'bg-[#FAF3D1] text-[#785A12] border-[#E9E5A8]',
    destructive: 'bg-[#FBE6E3] text-[#8B2C24] border-[#F3C9B2]',
    info: 'bg-[#EAE6F2] text-[#453860] border-[#DCD5E8]',
    audit: 'bg-[#C9DDD0]/40 text-[#274535] border-[#C9DDD0]',
    yellow: 'bg-[#E9E5A8]/50 text-[#615914] border-[#E9E5A8]',
    peach: 'bg-[#F3C9B2]/40 text-[#8B2C24] border-[#F3C9B2]',
    lavender: 'bg-[#DCD5E8]/50 text-[#453860] border-[#DCD5E8]',
    mint: 'bg-[#C9DDD0]/50 text-[#274535] border-[#C9DDD0]',
    // Hackathon domain statuses
    OPEN: 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]',
    LIVE: 'bg-[#E2EBDD] text-[#274535] border-[#355C45]/40 font-bold',
    JUDGING: 'bg-[#FAF3D1] text-[#785A12] border-[#E9E5A8]',
    COMPLETED: 'bg-[#F7F4EA] text-[#6D7068] border-[#DCDDD3]',
    REGISTERED: 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]',
    SUBMITTED: 'bg-[#EAE6F2] text-[#453860] border-[#DCD5E8]',
    PENDING: 'bg-[#FAF3D1] text-[#785A12] border-[#E9E5A8]',
    APPROVED: 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]',
    LOCKED: 'bg-[#F7F4EA] text-[#6D7068] border-[#DCDDD3]',
    EDITABLE: 'bg-[#C9DDD0]/40 text-[#274535] border-[#C9DDD0]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-xs gap-2',
  };

  return (
    <span className={cn(base, variants[variant] || variants.default, sizes[size], className)} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
};
