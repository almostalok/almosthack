import React from 'react';
import { Badge, BadgeVariant } from './Badge';
import { cn } from '@almosthack/utils';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export interface RegistrationStatusProps {
  status: 'REGISTERED' | 'PENDING' | 'WITHDRAWN' | 'REJECTED' | 'WAITLISTED' | string;
  trackName?: string;
  challengeName?: string;
  className?: string;
}

export const RegistrationStatus: React.FC<RegistrationStatusProps> = ({
  status,
  trackName,
  challengeName,
  className,
}) => {
  const getBadgeVariant = (st: string): BadgeVariant => {
    switch (st.toUpperCase()) {
      case 'REGISTERED':
      case 'APPROVED':
        return 'REGISTERED';
      case 'PENDING':
      case 'WAITLISTED':
        return 'PENDING';
      case 'WITHDRAWN':
      case 'REJECTED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getIcon = (st: string) => {
    switch (st.toUpperCase()) {
      case 'REGISTERED':
      case 'APPROVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#274535]" />;
      case 'PENDING':
      case 'WAITLISTED':
        return <Clock className="w-3.5 h-3.5 text-[#785A12]" />;
      default:
        return <XCircle className="w-3.5 h-3.5 text-[#8B2C24]" />;
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-2 font-mono text-xs', className)}>
      <Badge variant={getBadgeVariant(status)} size="md" className="gap-1.5">
        {getIcon(status)}
        {status}
      </Badge>
      {(trackName || challengeName) && (
        <span className="text-[#6D7068] text-[11px] truncate">
          {trackName && <span>Track: <strong className="text-[#171914]">{trackName}</strong></span>}
          {trackName && challengeName && ' • '}
          {challengeName && <span>Challenge: <strong className="text-[#171914]">{challengeName}</strong></span>}
        </span>
      )}
    </div>
  );
};
