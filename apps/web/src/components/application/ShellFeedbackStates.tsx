import React from 'react';
import { AlertTriangle, RefreshCw, Plus, ArrowLeft } from 'lucide-react';
import { Button, Card } from '@almosthack/ui';

export interface PageLoadingStateProps {
  message?: string;
}

export const PageLoadingState: React.FC<PageLoadingStateProps> = ({
  message = 'Loading workspace context...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] p-8 text-center space-y-4 font-mono text-xs text-[#6D7068]">
      <div className="w-8 h-8 rounded-full border-2 border-[#DCDDD3] border-t-[#028051] animate-spin" />
      <p>{message}</p>
    </div>
  );
};

export interface PageErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export const PageErrorState: React.FC<PageErrorStateProps> = ({
  title = 'Something went sideways.',
  message = "We couldn't load this workspace view. Please try refreshing.",
  onRetry,
  onBack,
}) => {
  return (
    <Card className="max-w-lg mx-auto p-8 text-center space-y-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs my-12">
      <div className="w-12 h-12 rounded-full bg-[#FBE6E3] border border-[#F3C9B2] flex items-center justify-center mx-auto text-[#8B2C24]">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-heading font-extrabold text-[#171914]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm font-body text-[#6D7068] leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onBack && (
          <Button variant="secondary" size="sm" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </Button>
        )}
        {onRetry && (
          <Button variant="primary" size="sm" onClick={onRetry} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    </Card>
  );
};

export interface PageEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const PageEmptyState: React.FC<PageEmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <Card className="p-12 text-center space-y-4 bg-[#FFFDF8] border border-dashed border-[#DCDDD3] max-w-xl mx-auto my-8">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-center mx-auto text-[#6D7068]">
          {icon}
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-lg font-heading font-extrabold text-[#171914]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm font-body text-[#6D7068] max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>{actionLabel}</span>
          </Button>
        </div>
      )}
    </Card>
  );
};
