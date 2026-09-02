'use client';

import React from 'react';
import {
  GitBranch,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Github,
} from 'lucide-react';
import { Button } from '@almosthack/ui';

export interface HackerRepositoryCardProps {
  repositoryUrl?: string;
  repositoryFullName?: string;
  defaultBranch?: string;
  commitSha?: string;
  isVerified?: boolean;
  onConnectRepository?: () => void;
}

export const HackerRepositoryCard: React.FC<HackerRepositoryCardProps> = ({
  repositoryUrl = 'https://github.com/byteforge/byteforge-core',
  repositoryFullName = 'byteforge/byteforge-core',
  defaultBranch = 'main',
  commitSha = '7f9c2a1e4b3d8c9a0f1e2d3c4b5a6f7e8d9c0b1a',
  isVerified = true,
  onConnectRepository,
}) => {
  const isConnected = !!repositoryFullName;

  return (
    <div className="p-5 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E2EBDD] border border-[#B8CEB0] flex items-center justify-center text-[#028051]">
            <Github className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-[#171914]">
              Connected Repository
            </h3>
            <span className="text-[11px] font-mono text-[#6D7068]">
              Automated deterministic SHA-256 integrity scanning
            </span>
          </div>
        </div>

        {isConnected ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051]">
            <CheckCircle2 className="w-3 h-3" />
            Connected & Synced
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFF4DC] border border-[#F0D597] text-[#785A12]">
            <AlertTriangle className="w-3 h-3" />
            Not Connected
          </span>
        )}
      </div>

      {isConnected ? (
        <div className="space-y-3">
          <div className="p-3.5 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="space-y-1 truncate">
              <div className="flex items-center gap-1.5 text-[#171914] font-bold">
                <GitBranch className="w-3.5 h-3.5 text-[#028051] shrink-0" />
                <span className="truncate">{repositoryFullName}</span>
                <span className="text-[10px] text-[#6D7068] font-normal">
                  ({defaultBranch})
                </span>
              </div>
              <div className="text-[11px] text-[#6D7068] truncate">
                Verified Commit: <strong className="text-[#171914]">{commitSha.substring(0, 16)}...</strong>
              </div>
            </div>

            {repositoryUrl && (
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-[6px] bg-[#FFFDF8] border border-[#DCDDD3] hover:border-[#028051] text-xs font-mono font-bold text-[#171914] flex items-center gap-1.5 shrink-0"
              >
                <span>Open in GitHub</span>
                <ExternalLink className="w-3 h-3 text-[#6D7068]" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#028051]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Repository passes pre-submission integrity & license checks.</span>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center space-y-3">
          <p className="text-xs font-mono text-[#6D7068]">
            Connect your GitHub project repository to sync commits and enable automated judging evaluation.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onConnectRepository}
            leftIcon={<Github className="w-3.5 h-3.5" />}
            className="text-xs font-mono font-bold"
          >
            Connect GitHub
          </Button>
        </div>
      )}
    </div>
  );
};
