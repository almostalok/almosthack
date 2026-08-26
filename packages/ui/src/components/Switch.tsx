import React from 'react';
import { cn } from '@almosthack/utils';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: string;
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  description,
  id,
  className,
}) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;
  const generatedId = React.useId();
  const switchId = id || generatedId;

  const handleToggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (controlledChecked === undefined) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  return (
    <div className={cn('inline-flex items-center gap-3 select-none text-left', className)}>
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C45] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EA] disabled:cursor-not-allowed disabled:opacity-50',
          isChecked ? 'bg-[#355C45]' : 'bg-[#DCDDD3]'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-[#FFFDF8] shadow-xs ring-0 transition duration-200 ease-in-out',
            isChecked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      {(label || description) && (
        <label htmlFor={switchId} className="flex flex-col cursor-pointer" onClick={handleToggle}>
          {label && <span className="text-sm font-medium text-[#171914]">{label}</span>}
          {description && <span className="text-xs text-[#6D7068]">{description}</span>}
        </label>
      )}
    </div>
  );
};
