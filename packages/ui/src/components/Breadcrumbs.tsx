import React from 'react';
import { cn } from '@almosthack/utils';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav className={cn('flex items-center gap-1.5 text-xs font-mono text-zinc-400', className)}>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight className="w-3 h-3 text-zinc-600" />}
          {item.href ? (
            <a href={item.href} className="hover:text-zinc-100 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-zinc-200 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
