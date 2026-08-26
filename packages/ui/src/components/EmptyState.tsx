import React from 'react';
import { cn } from '@almosthack/utils';
import { Button } from './Button';
import { Scribble } from './Scribble';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  scribbleVariant?: 'sparkle' | 'circle' | 'asterisk' | 'highlight';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  scribbleVariant = 'sparkle',
  className,
}) => {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center p-12 border border-dashed border-[#DCDDD3] rounded-[16px] text-center bg-[#FFFDF8] shadow-xs overflow-hidden',
        className
      )}
    >
      {/* Subtle decorative background scribble */}
      <div className="absolute top-4 right-6 opacity-30 pointer-events-none">
        <Scribble variant={scribbleVariant} />
      </div>

      <div className="p-4 bg-[#F7F4EA] border border-[#DCDDD3] rounded-full mb-4 text-[#355C45] flex items-center justify-center shadow-xs">
        {icon || <Scribble variant="asterisk" className="w-8 h-8 text-[#355C45]" />}
      </div>

      <h3 className="text-xl font-bold text-[#171914] font-heading mb-1.5">{title}</h3>
      <p className="text-sm text-[#6D7068] max-w-md mb-6 font-body leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
