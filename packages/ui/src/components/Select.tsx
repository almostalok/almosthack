import React from 'react';
import { cn } from '@almosthack/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, id, disabled, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="text-xs font-mono font-semibold tracking-wider uppercase text-[#6D7068]">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-10 bg-[#FFFDF8] text-[#171914] text-sm border border-[#DCDDD3] rounded-[10px] pl-3 pr-9 font-body transition-all appearance-none cursor-pointer focus:outline-none focus:border-[#355C45] focus:ring-2 focus:ring-[#355C45]/20 disabled:opacity-50 disabled:bg-[#F7F4EA] disabled:cursor-not-allowed shadow-2xs',
              error && 'border-[#F3C9B2] focus:border-[#8B2C24] focus:ring-[#8B2C24]/20',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3 text-[#6D7068] pointer-events-none flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <span className="text-xs text-[#8B2C24] font-mono">{error}</span>
        ) : hint ? (
          <span className="text-xs text-[#6D7068] font-body">{hint}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
