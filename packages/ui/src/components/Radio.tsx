import React from 'react';
import { cn } from '@almosthack/utils';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, disabled, checked, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const radioId = id || generatedId;

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'inline-flex items-start gap-2.5 cursor-pointer select-none text-left',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={radioId}
            type="radio"
            ref={ref}
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-4.5 h-4.5 rounded-full border border-[#DCDDD3] bg-[#FFFDF8] transition-all peer-checked:border-[#355C45] peer-focus-visible:ring-2 peer-focus-visible:ring-[#355C45]/20 flex items-center justify-center shadow-2xs',
              className
            )}
          >
            <div className="w-2 h-2 rounded-full bg-[#355C45] opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-[#171914]">{label}</span>}
            {description && <span className="text-xs text-[#6D7068]">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
