import React from 'react';
import { cn } from '@almosthack/utils';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  compact?: boolean;
}

export const Table: React.FC<TableProps> = ({
  className,
  compact = false,
  children,
  ...props
}) => (
  <div className="w-full overflow-x-auto border border-[#DCDDD3] rounded-[14px] bg-[#FFFDF8] shadow-xs">
    <table className={cn('w-full text-left text-xs font-body text-[#171914]', compact ? 'text-xs' : 'text-sm', className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead className={cn('bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[11px] font-semibold text-[#6D7068] uppercase tracking-wider', className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody className={cn('divide-y divide-[#DCDDD3]/80 bg-[#FFFDF8]', className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => (
  <tr className={cn('hover:bg-[#F7F4EA]/70 transition-colors duration-100', className)} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th className={cn('px-5 py-3.5 font-semibold text-[#6D7068] text-left select-none', className)} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={cn('px-5 py-4 align-middle text-[#171914] font-body', className)} {...props}>
    {children}
  </td>
);

export const TableFooter: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tfoot className={cn('bg-[#F7F4EA] border-t border-[#DCDDD3] font-mono text-xs font-semibold text-[#6D7068]', className)} {...props}>
    {children}
  </tfoot>
);
