'use client';

import React from 'react';
import { Card, Button } from '@almosthack/ui';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Rocket,
  Building2,
  Calendar,
  Users,
  Layers,
  Scale,
  Bot,
  GitBranch,
} from 'lucide-react';

export interface ReadinessItem {
  id: string;
  tabId: string;
  title: string;
  summary: string;
  valid: boolean;
  message?: string;
  icon: any;
}

export interface ConfigSectionReadinessProps {
  items: ReadinessItem[];
  onNavigateTab: (tabId: string) => void;
  onOpenPublishDialog: () => void;
  isLocked: boolean;
  status: string;
}

export const ConfigSectionReadiness: React.FC<ConfigSectionReadinessProps> = ({
  items,
  onNavigateTab,
  onOpenPublishDialog,
  isLocked,
  status,
}) => {
  const allValid = items.every((i) => i.valid);
  const invalidCount = items.filter((i) => !i.valid).length;

  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-heading font-extrabold text-[#171914]">
              Configuration Readiness & Launch Pre-Flight
            </h2>
            <p className="text-xs text-[#6D7068] font-body mt-0.5">
              Comprehensive verification checklist of operational parameters and scoring criteria.
            </p>
          </div>

          <span
            className={`self-start sm:self-auto px-3 py-1 rounded-[6px] text-xs font-mono font-bold border ${
              allValid
                ? 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]'
                : 'bg-[#FFF4DC] text-[#785A12] border-[#F0D597]'
            }`}
          >
            {allValid ? '✓ READY TO PUBLISH' : `⚠ ${invalidCount} ITEMS NEED ATTENTION`}
          </span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-[8px] border transition-colors flex items-center justify-between gap-3 ${
                item.valid
                  ? 'bg-[#FFFDF8] border-[#DCDDD3] hover:border-[#B8CEB0]'
                  : 'bg-[#FBE6E3]/50 border-[#F3C9B2]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 ${
                    item.valid ? 'bg-[#E2EBDD] text-[#028051]' : 'bg-[#FBE6E3] text-[#8B2C24]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-heading font-bold text-[#171914]">
                      {item.title}
                    </span>
                    {item.valid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#028051] shrink-0" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-[#8B2C24] bg-[#FBE6E3] px-1.5 py-0.2 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-body text-[#6D7068] truncate">
                    {item.valid ? item.summary : item.message}
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigateTab(item.tabId)}
                className="text-xs font-mono py-1 px-2.5 h-7 shrink-0 text-[#6D7068] hover:text-[#171914]"
              >
                <span>Edit</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Publish Bar */}
      <div className="pt-4 border-t border-[#DCDDD3] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-mono text-[#6D7068]">
          <span>Current Status: </span>
          <strong className="text-[#171914] uppercase">{status}</strong>
        </div>

        {!isLocked && (
          <Button
            variant="primary"
            size="md"
            onClick={onOpenPublishDialog}
            disabled={!allValid}
            leftIcon={<Rocket className="w-4 h-4" />}
            className="w-full sm:w-auto text-xs font-mono h-9 px-5 bg-[#028051] hover:bg-[#355C45] shadow-xs"
          >
            Publish Hackathon
          </Button>
        )}
      </div>
    </Card>
  );
};
