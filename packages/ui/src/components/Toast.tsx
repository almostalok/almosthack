import React from 'react';
import { cn } from '@almosthack/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  description,
  onDismiss,
  className,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#274535]" />,
    error: <AlertCircle className="w-4 h-4 text-[#8B2C24]" />,
    info: <Info className="w-4 h-4 text-[#355C45]" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn(
        'min-w-[300px] max-w-md bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] p-4 shadow-elevated flex items-start gap-3 text-left font-body select-none',
        className
      )}
    >
      <div className="mt-0.5 shrink-0">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-mono font-bold text-[#171914]">{title}</h4>
        {description && <p className="text-xs text-[#6D7068] mt-0.5 font-body">{description}</p>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 -mr-1 -mt-1 text-[#6D7068] hover:text-[#171914] rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
};
