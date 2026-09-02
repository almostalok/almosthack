'use client';

import React from 'react';
import { Card } from '@almosthack/ui';
import { Bot, GitBranch, ShieldCheck } from 'lucide-react';
import {
  AIUsagePolicy,
  PreExistingCodePolicy,
  OpenSourcePolicy,
  RepositoryPolicy,
} from '@almosthack/types';

export interface CodePolicyConfigData {
  aiUsagePolicy: AIUsagePolicy;
  aiDisclosureRequired: boolean;
  preExistingCodePolicy: PreExistingCodePolicy;
  openSourcePolicy: OpenSourcePolicy;
  githubRequired: boolean;
  repositoryPolicy: RepositoryPolicy;
}

export interface ConfigSectionCodePolicyProps {
  data: CodePolicyConfigData;
  onChange: (data: Partial<CodePolicyConfigData>) => void;
  isLocked?: boolean;
}

export const ConfigSectionCodePolicy: React.FC<ConfigSectionCodePolicyProps> = ({
  data,
  onChange,
  isLocked = false,
}) => {
  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <h2 className="text-base font-heading font-extrabold text-[#171914]">
          Code Integrity, AI & Repository Policies
        </h2>
        <p className="text-xs text-[#6D7068] font-body mt-0.5">
          Define automated forensics requirements, AI assistant disclosure, and GitHub commit tracking.
        </p>
      </div>

      <div className="space-y-4">
        {/* Section 1: AI Policies */}
        <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[#171914] flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-[#028051]" />
            AI & Autonomous Tool Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                AI Usage Level
              </label>
              <select
                value={data.aiUsagePolicy}
                onChange={(e) => onChange({ aiUsagePolicy: e.target.value as any })}
                disabled={isLocked}
                className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] disabled:opacity-60"
              >
                <option value={AIUsagePolicy.ALLOWED}>ALLOWED (AI Tools & LLMs Permitted)</option>
                <option value={AIUsagePolicy.RESTRICTED}>RESTRICTED (Limited Scaffolding Only)</option>
                <option value={AIUsagePolicy.PROHIBITED}>PROHIBITED (Zero AI Assistance Allowed)</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-body text-[#171914] cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.aiDisclosureRequired}
                  onChange={(e) => onChange({ aiDisclosureRequired: e.target.checked })}
                  disabled={isLocked}
                  className="rounded border-[#DCDDD3] text-[#028051] focus:ring-[#028051] w-4 h-4"
                />
                <span>Mandatory AI Tool & Prompt Disclosure Required</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Pre-existing Code & Open Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#028051]" />
              Pre-Existing Code Policy
            </label>
            <select
              value={data.preExistingCodePolicy}
              onChange={(e) => onChange({ preExistingCodePolicy: e.target.value as any })}
              disabled={isLocked}
              className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] disabled:opacity-60"
            >
              <option value={PreExistingCodePolicy.PROHIBITED}>
                PROHIBITED (All code built fresh during sprint)
              </option>
              <option value={PreExistingCodePolicy.ALLOWED_WITH_DISCLOSURE}>
                ALLOWED WITH DISCLOSURE (Prior repos declared)
              </option>
              <option value={PreExistingCodePolicy.ALLOWED}>
                ALLOWED (Unrestricted code reuse)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Open-Source Licensing Policy
            </label>
            <select
              value={data.openSourcePolicy}
              onChange={(e) => onChange({ openSourcePolicy: e.target.value as any })}
              disabled={isLocked}
              className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] disabled:opacity-60"
            >
              <option value={OpenSourcePolicy.ALLOWED_WITH_ATTRIBUTION}>
                ALLOWED WITH ATTRIBUTION (Standard OSS)
              </option>
              <option value={OpenSourcePolicy.ALLOWED}>ALLOWED (Unrestricted)</option>
              <option value={OpenSourcePolicy.RESTRICTED}>
                RESTRICTED (Permissive licenses only: MIT/Apache-2)
              </option>
              <option value={OpenSourcePolicy.PROHIBITED}>
                PROHIBITED (No 3rd-party libraries)
              </option>
            </select>
          </div>
        </div>

        {/* Section 3: GitHub & Repository Policy */}
        <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[#171914] flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-[#028051]" />
            GitHub Repository Provisioning
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center pt-2">
              <label className="flex items-center gap-2 text-xs font-body text-[#171914] cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.githubRequired}
                  onChange={(e) => onChange({ githubRequired: e.target.checked })}
                  disabled={isLocked}
                  className="rounded border-[#DCDDD3] text-[#028051] focus:ring-[#028051] w-4 h-4"
                />
                <span>Mandatory GitHub Repository Linkage Required</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                Repository Provisioning Policy
              </label>
              <select
                value={data.repositoryPolicy}
                onChange={(e) => onChange({ repositoryPolicy: e.target.value as any })}
                disabled={isLocked}
                className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] disabled:opacity-60"
              >
                <option value={RepositoryPolicy.PLATFORM_MANAGED}>
                  PLATFORM MANAGED (AlmostHack creates clean GitHub repo)
                </option>
                <option value={RepositoryPolicy.EXTERNAL_ALLOWED}>
                  EXTERNAL ALLOWED (Builders link existing repository)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
