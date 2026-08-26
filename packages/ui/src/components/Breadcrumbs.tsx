import React from 'react';
import { cn } from '@almosthack/utils';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-xs font-mono text-[#6D7068]', className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#9A9C94] shrink-0" />}
            {item.href && !isLast ? (
              <a
                href={item.href}
                onClick={item.onClick}
                className="hover:text-[#355C45] transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#355C45]"
              >
                {item.label}
              </a>
            ) : item.onClick && !isLast ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-[#355C45] transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#355C45]"
              >
                {item.label}
              </button>
            ) : (
              <span className={cn(isLast ? 'text-[#171914] font-semibold' : 'text-[#6D7068]')}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export const Breadcrumb = Breadcrumbs;
