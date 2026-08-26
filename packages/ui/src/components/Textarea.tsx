import React from 'react';
import { cn } from '@almosthack/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, disabled, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-mono font-semibold tracking-wider uppercase text-[#6D7068]">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full bg-[#FFFDF8] text-[#171914] text-sm border border-[#DCDDD3] rounded-[10px] p-3 font-body transition-all placeholder:text-[#9A9C94] focus:outline-none focus:border-[#355C45] focus:ring-2 focus:ring-[#355C45]/20 disabled:opacity-50 disabled:bg-[#F7F4EA] disabled:cursor-not-allowed shadow-2xs resize-y',
            error && 'border-[#F3C9B2] focus:border-[#8B2C24] focus:ring-[#8B2C24]/20 bg-[#FFFDFB]',
            className
          )}
          {...props}
        />
        {error ? (
          <span className="text-xs text-[#8B2C24] font-mono">{error}</span>
        ) : hint ? (
          <span className="text-xs text-[#6D7068] font-body">{hint}</span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
