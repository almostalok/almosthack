import React from 'react';
import { Command } from 'cmdk';
import { Search, Trophy, GitBranch, ShieldCheck, Award, Settings, FileText } from 'lucide-react';
import { cn } from '@almosthack/utils';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden font-mono text-xs">
        <Command className="w-full">
          <div className="flex items-center px-4 border-b border-zinc-800 bg-zinc-900/60">
            <Search className="w-4 h-4 text-zinc-400 mr-2" />
            <Command.Input
              placeholder="Type a command or search platform features..."
              className="w-full h-12 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xs px-2">
              ESC
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-zinc-900">
            <Command.Empty className="p-4 text-center text-zinc-500">
              No matching commands found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-[10px] uppercase text-zinc-600 px-2 py-1 font-semibold">
              <Command.Item
                onSelect={() => { onSelectAction('/overview'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-emerald-400 rounded cursor-pointer transition-colors"
              >
                <Search className="w-3.5 h-3.5" /> Overview Dashboard
              </Command.Item>
              <Command.Item
                onSelect={() => { onSelectAction('/hackathons'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-emerald-400 rounded cursor-pointer transition-colors"
              >
                <Trophy className="w-3.5 h-3.5" /> Hackathon Management
              </Command.Item>
              <Command.Item
                onSelect={() => { onSelectAction('/repositories'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-emerald-400 rounded cursor-pointer transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" /> Repository Intelligence
              </Command.Item>
              <Command.Item
                onSelect={() => { onSelectAction('/judges'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-emerald-400 rounded cursor-pointer transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" /> Judge Calibration Engine
              </Command.Item>
              <Command.Item
                onSelect={() => { onSelectAction('/audit-logs'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-emerald-400 rounded cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Verifiable Audit Ledger
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
