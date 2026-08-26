import React from 'react';
import { Command } from 'cmdk';
import { Search as SearchIcon, Trophy, GitBranch, ShieldCheck, Award, User, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-[#171914]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#FFFDF8] border border-[#DCDDD3] rounded-[16px] shadow-modal overflow-hidden font-body text-xs text-left">
        <Command className="w-full">
          <div className="flex items-center px-4 border-b border-[#DCDDD3] bg-[#FFFDF8]">
            <SearchIcon className="w-4 h-4 text-[#6D7068] mr-2.5 shrink-0" />
            <Command.Input
              placeholder="Search platform features, hackathons, logs..."
              className="w-full h-12 bg-transparent text-[#171914] text-sm placeholder:text-[#9A9C94] focus:outline-none font-body"
            />
            <button
              onClick={onClose}
              className="text-[#6D7068] hover:text-[#171914] text-[10px] font-mono px-2 py-1 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[5px]"
            >
              ESC
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-[#DCDDD3]/50">
            <Command.Empty className="p-4 text-center text-[#6D7068] font-mono">
              No matching results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-[10px] uppercase font-mono font-semibold text-[#9A9C94] px-2 py-1.5">
              <Command.Item
                onSelect={() => { onSelectAction('/overview'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-[#171914] hover:bg-[#E2EBDD] hover:text-[#274535] rounded-[8px] cursor-pointer transition-colors"
              >
                <SearchIcon className="w-3.5 h-3.5 text-[#355C45]" /> Overview Dashboard
              </Command.Item>
              <Command.Item
                onSelect={() => { onSelectAction('/profile'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-[#171914] hover:bg-[#E2EBDD] hover:text-[#274535] rounded-[8px] cursor-pointer transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#355C45]" /> User Profile & Identity
              </Command.Item>
              <Command.Item
                onSelect={() => { onSelectAction('/hackathons'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-[#171914] hover:bg-[#E2EBDD] hover:text-[#274535] rounded-[8px] cursor-pointer transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-[#785A12]" /> Hackathons Hub
              </Command.Item>
              <Command.Item
                onSelect={() => { onSelectAction('/repositories'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-[#171914] hover:bg-[#E2EBDD] hover:text-[#274535] rounded-[8px] cursor-pointer transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#355C45]" /> Repository Intelligence
              </Command.Item>
              <Command.Item
                onSelect={() => { onSelectAction('/judges'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-[#171914] hover:bg-[#E2EBDD] hover:text-[#274535] rounded-[8px] cursor-pointer transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-[#785A12]" /> Judge Calibration Engine
              </Command.Item>
              <Command.Item
                onSelect={() => { onSelectAction('/audit-logs'); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-[#171914] hover:bg-[#E2EBDD] hover:text-[#274535] rounded-[8px] cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#355C45]" /> Verifiable Audit Ledger
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
