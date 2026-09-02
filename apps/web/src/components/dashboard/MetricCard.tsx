'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '@almosthack/ui';
import { cn } from '@almosthack/utils';
import { MetricItem } from './dashboard-mock-data';

export interface MetricCardProps {
  item: MetricItem;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ item, className }) => {
  const content = (
    <Card
      className={cn(
        'p-4 sm:p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs flex flex-col justify-between text-left transition-all duration-150',
        item.href ? 'hover:border-[#355C45]/60 hover:shadow-xs group cursor-pointer' : '',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6D7068] group-hover:text-[#171914] transition-colors">
          {item.label}
        </span>
        {item.href && (
          <ArrowUpRight className="w-3.5 h-3.5 text-[#9A9C94] group-hover:text-[#028051] transition-colors shrink-0" />
        )}
      </div>

      <div className="my-2">
        <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight block">
          {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-[#6D7068] font-body pt-1 border-t border-[#DCDDD3]/50">
        <span className="truncate">{item.context || 'Active telemetry'}</span>
        {item.trend && (
          <span className="font-mono text-[11px] font-semibold text-[#028051] shrink-0 ml-1">
            {item.trend}
          </span>
        )}
      </div>
    </Card>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] rounded-[10px]">
        {content}
      </Link>
    );
  }

  return content;
};
