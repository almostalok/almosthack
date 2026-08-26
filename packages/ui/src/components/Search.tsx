import React from 'react';
import { cn } from '@almosthack/utils';
import { Search as SearchIcon, X } from 'lucide-react';

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  shortcut?: string;
}

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, value, defaultValue, onChange, onClear, shortcut = '⌘K', placeholder = 'Search...', ...props }, ref) => {
    const [internalVal, setInternalVal] = React.useState(defaultValue || '');
    const isControlled = value !== undefined;
    const currentVal = isControlled ? value : internalVal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalVal(e.target.value);
      onChange?.(e.target.value);
    };

    const handleClear = () => {
      if (!isControlled) setInternalVal('');
      onChange?.('');
      onClear?.();
    };

    return (
      <div className={cn('relative flex items-center w-full', className)}>
        <div className="absolute left-3 text-[#6D7068] pointer-events-none flex items-center justify-center">
          <SearchIcon className="w-4 h-4" />
        </div>
        <input
          ref={ref}
          type="text"
          value={currentVal}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full h-10 bg-[#FFFDF8] text-[#171914] text-sm border border-[#DCDDD3] rounded-[10px] pl-9 pr-14 font-body transition-all placeholder:text-[#9A9C94] focus:outline-none focus:border-[#355C45] focus:ring-2 focus:ring-[#355C45]/20 shadow-2xs"
          {...props}
        />
        <div className="absolute right-2.5 flex items-center gap-1">
          {currentVal ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#6D7068] hover:text-[#171914] rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : shortcut ? (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#6D7068] bg-[#F7F4EA] border border-[#DCDDD3] rounded-[5px]">
              {shortcut}
            </kbd>
          ) : null}
        </div>
      </div>
    );
  }
);

Search.displayName = 'Search';
