import React from 'react';
import { cn } from '@almosthack/utils';
import { Terminal } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <Terminal className="w-8 h-8 text-zinc-500" />,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-10 border border-dashed border-zinc-800 rounded-lg text-center bg-zinc-950/30', className)}>
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-zinc-200 font-heading mb-1">{title}</h3>
      <p className="text-xs text-zinc-400 max-w-sm mb-6 font-sans">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
