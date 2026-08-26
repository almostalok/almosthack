import React from 'react';
import { cn } from '@almosthack/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  if (totalPages <= 1) return null;

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const generatePagination = () => {
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

      let pages: (number | 'dots-left' | 'dots-right')[] = range(startPage, endPage);

      const hasLeftSpill = startPage > 2;
      const hasRightSpill = totalPages - endPage > 1;
      const spillOffset = totalNumbers - (pages.length + 1);

      if (!hasLeftSpill && hasRightSpill) {
        const extraPages = range(endPage + 1, endPage + spillOffset);
        pages = [...pages, ...extraPages, 'dots-right'];
      } else if (hasLeftSpill && !hasRightSpill) {
        const extraPages = range(startPage - spillOffset, startPage - 1);
        pages = ['dots-left', ...extraPages, ...pages];
      } else if (hasLeftSpill && hasRightSpill) {
        pages = ['dots-left', ...pages, 'dots-right'];
      }

      return [1, ...pages, totalPages];
    }

    return range(1, totalPages);
  };

  const pages = generatePagination();

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('flex items-center justify-center gap-1 font-mono text-xs select-none', className)}
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-2.5 h-8"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
      </Button>

      {pages.map((page, index) => {
        if (page === 'dots-left' || page === 'dots-right') {
          return (
            <span key={`dots-${index}`} className="px-2 text-[#9A9C94] flex items-center">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </span>
          );
        }

        const isCurrent = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              'h-8 w-8 rounded-[8px] flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C45]',
              isCurrent
                ? 'bg-[#355C45] text-[#FFFDF8] border border-[#274535] shadow-xs'
                : 'bg-[#FFFDF8] text-[#6D7068] hover:bg-[#F7F4EA] hover:text-[#171914] border border-[#DCDDD3]'
            )}
          >
            {page}
          </button>
        );
      })}

      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-2.5 h-8"
        aria-label="Go to next page"
      >
        Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
      </Button>
    </nav>
  );
};
