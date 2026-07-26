import React from 'react';
import { cn } from '@almosthack/utils';
import { Search, Bell, Sun, Moon, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

export interface TopHeaderProps {
  userEmail?: string;
  role?: string;
  onOpenCommandPalette?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  className?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  userEmail = 'architect@almosthack.io',
  role = 'ORGANIZER',
  onOpenCommandPalette,
  isDarkMode = true,
  onToggleTheme,
  className,
}) => {
  return (
    <header className={cn('h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-6 flex items-center justify-between sticky top-0 z-40 font-mono', className)}>
      {/* Quick Search Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-md text-zinc-400 hover:text-zinc-200 text-xs transition-colors w-72"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="truncate">Search hackathons, judges, logs...</span>
        <kbd className="ml-auto text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">
          ⌘K
        </kbd>
      </button>

      {/* Right Tools & User Info */}
      <div className="flex items-center gap-4">
        <Badge variant="accent" size="sm" className="gap-1 hidden sm:inline-flex">
          <ShieldAlert className="w-3 h-3" /> Audit Active
        </Badge>

        <button
          onClick={onToggleTheme}
          className="p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-emerald-400">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left text-xs">
            <span className="font-semibold text-zinc-200 font-sans leading-none">{userEmail}</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
