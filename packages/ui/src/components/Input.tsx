import React from 'react';
import { cn } from '@almosthack/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, type = 'text', id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-mono font-semibold tracking-wider uppercase text-[#6D7068]">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-[#6D7068] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-10 bg-[#FFFDF8] text-[#171914] text-sm border border-[#DCDDD3] rounded-[10px] px-3 font-body transition-all placeholder:text-[#9A9C94] focus:outline-none focus:border-[#355C45] focus:ring-2 focus:ring-[#355C45]/20 disabled:opacity-50 disabled:bg-[#F7F4EA] disabled:cursor-not-allowed shadow-2xs',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-[#F3C9B2] focus:border-[#8B2C24] focus:ring-[#8B2C24]/20 bg-[#FFFDFB]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#6D7068] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
