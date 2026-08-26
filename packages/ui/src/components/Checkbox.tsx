import React from 'react';
import { cn } from '@almosthack/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, disabled, checked, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex flex-col gap-1 text-left">
        <label
          htmlFor={checkboxId}
          className={cn(
            'inline-flex items-start gap-2.5 cursor-pointer select-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              id={checkboxId}
              type="checkbox"
              ref={ref}
              disabled={disabled}
              checked={checked}
              onChange={onChange}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                'w-4.5 h-4.5 rounded-[5px] border border-[#DCDDD3] bg-[#FFFDF8] transition-all peer-checked:bg-[#355C45] peer-checked:border-[#274535] peer-focus-visible:ring-2 peer-focus-visible:ring-[#355C45]/20 flex items-center justify-center text-[#FFFDF8] shadow-2xs',
                error && 'border-[#F3C9B2]',
                className
              )}
            >
              <Check className="w-3 h-3 stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
          </div>
          {(label || description) && (
            <div className="flex flex-col">
              {label && <span className="text-sm font-medium text-[#171914]">{label}</span>}
              {description && <span className="text-xs text-[#6D7068]">{description}</span>}
            </div>
          )}
        </label>
        {error && <span className="text-xs text-[#8B2C24] font-mono ml-7">{error}</span>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
