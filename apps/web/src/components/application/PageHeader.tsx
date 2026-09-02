import React from 'react';
import { cn } from '@almosthack/utils';
import { Breadcrumbs, BreadcrumbItem } from '@almosthack/ui';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  badge,
  primaryAction,
  secondaryActions,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-4 pb-2 border-b border-[#DCDDD3]/80 text-left', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-[#6D7068] font-body max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {(primaryAction || secondaryActions) && (
          <div className="flex items-center gap-2.5 shrink-0">
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>

      {/* Optional Toolbar / Filter Bar / Tab Content */}
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
};
