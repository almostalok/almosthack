import React from 'react';
import { cn } from '@almosthack/utils';
import { Search as SearchIcon, Bell, Sun, Moon, ShieldCheck, Menu } from 'lucide-react';
import { Badge } from './Badge';

export interface TopHeaderProps {
  userEmail?: string;
  userName?: string;
  role?: string;
  onOpenCommandPalette?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onToggleMobileMenu?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  userEmail = 'architect@almosthack.io',
  userName,
  role = 'ORGANIZER',
  onOpenCommandPalette,
  isDarkMode = false,
  onToggleTheme,
  onToggleMobileMenu,
  children,
  className,
}) => {
  return (
    <header
      className={cn(
        'h-16 bg-[#FFFDF8] border-b border-[#DCDDD3] px-6 flex items-center justify-between sticky top-0 z-40 font-body select-none shadow-2xs',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA] rounded-[8px] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Quick Search Trigger */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-3 px-3 py-2 bg-[#F7F4EA] border border-[#DCDDD3] hover:border-[#355C45]/50 rounded-[10px] text-[#6D7068] hover:text-[#171914] text-xs transition-colors w-64 sm:w-80 shadow-2xs cursor-pointer"
          >
            <SearchIcon className="w-4 h-4 text-[#6D7068]" />
            <span className="truncate">Search hackathons, judges, audit...</span>
            <kbd className="ml-auto text-[10px] font-mono bg-[#FFFDF8] px-1.5 py-0.5 rounded-[5px] text-[#6D7068] border border-[#DCDDD3]">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right Tools & User Info */}
      <div className="flex items-center gap-3">
        {children ? (
          children
        ) : (
          <>
            <Badge variant="accent" size="sm" className="gap-1 hidden sm:inline-flex">
              <ShieldCheck className="w-3.5 h-3.5 text-[#274535]" /> Ledger Active
            </Badge>

            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 text-[#6D7068] hover:text-[#171914] bg-[#F7F4EA] border border-[#DCDDD3] rounded-[8px] transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <div className="flex items-center gap-2.5 pl-2 border-l border-[#DCDDD3]">
              <div className="w-8 h-8 rounded-full bg-[#E2EBDD] border border-[#B8CEB0] flex items-center justify-center font-heading font-bold text-xs text-[#274535]">
                {(userName || userEmail).charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs">
                <span className="font-semibold text-[#171914] font-body leading-none">{userName || userEmail}</span>
                <span className="text-[10px] text-[#6D7068] font-mono mt-0.5">{role}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export const Navbar = TopHeader;
