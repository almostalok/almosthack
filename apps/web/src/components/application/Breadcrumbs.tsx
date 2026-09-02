import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@almosthack/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs font-mono', className)}>
      <ol className="flex items-center gap-1.5 text-[#6D7068]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#9A9C94] shrink-0" />}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-[#171914] transition-colors hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast ? 'text-[#171914] font-bold' : 'text-[#6D7068]')}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
