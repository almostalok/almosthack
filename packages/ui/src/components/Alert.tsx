import React from 'react';
import { cn } from '@almosthack/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'destructive' | 'neutral';
  title?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  className,
  variant = 'neutral',
  title,
  onClose,
  ...props
}) => {
  const icons = {
    info: <Info className="w-4 h-4 text-[#453860] shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-[#274535] shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-[#785A12] shrink-0" />,
    destructive: <AlertCircle className="w-4 h-4 text-[#8B2C24] shrink-0" />,
    neutral: <Info className="w-4 h-4 text-[#6D7068] shrink-0" />,
  };

  const variants = {
    info: 'bg-[#EAE6F2]/70 text-[#453860] border-[#DCD5E8]',
    success: 'bg-[#E2EBDD]/70 text-[#274535] border-[#B8CEB0]',
    warning: 'bg-[#FAF3D1]/70 text-[#785A12] border-[#E9E5A8]',
    destructive: 'bg-[#FBE6E3]/70 text-[#8B2C24] border-[#F3C9B2]',
    neutral: 'bg-[#F7F4EA] text-[#171914] border-[#DCDDD3]',
  };

  return (
    <div
      role="alert"
      className={cn(
        'p-4 rounded-[12px] border flex items-start gap-3 text-sm font-body transition-all text-left shadow-2xs',
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{icons[variant]}</div>
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-heading font-bold text-sm leading-tight mb-1">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 -mt-1 text-current opacity-60 hover:opacity-100 transition-opacity rounded-md"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
