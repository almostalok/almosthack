'use client';

import React from 'react';
import { Card, Input } from '@almosthack/ui';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface StepScheduleData {
  registrationStartsAt: string;
  registrationEndsAt: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
}

export interface StepScheduleProps {
  data: StepScheduleData;
  onChange: (data: Partial<StepScheduleData>) => void;
  errors: Record<string, string>;
}

export const StepSchedule: React.FC<StepScheduleProps> = ({
  data,
  onChange,
  errors,
}) => {
  // Validate date logic
  const isRegValid =
    data.registrationStartsAt &&
    data.registrationEndsAt &&
    new Date(data.registrationStartsAt).getTime() < new Date(data.registrationEndsAt).getTime();

  const isHackathonValid =
    data.startsAt &&
    data.endsAt &&
    new Date(data.startsAt).getTime() < new Date(data.endsAt).getTime();

  const isSequenceValid =
    data.registrationEndsAt &&
    data.startsAt &&
    new Date(data.registrationEndsAt).getTime() <= new Date(data.startsAt).getTime();

  const formatDateDisplay = (isoStr: string) => {
    if (!isoStr) return 'Not configured';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#171914]">
              Step 2: Operational Schedule & Lifecycle
            </h2>
            <p className="text-xs text-[#6D7068] font-body mt-0.5">
              Configure strict registration and hacking windows. Dates operate in timezone:{' '}
              <strong className="font-mono text-[#028051]">{data.timezone}</strong>.
            </p>
          </div>
          <span className="px-2 py-1 rounded-[6px] text-[11px] font-mono font-bold bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            {data.timezone}
          </span>
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-3">
        <h3 className="text-[11px] font-mono font-bold uppercase text-[#6D7068]">
          Operational Lifecycle Sequence
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {/* Phase 1 */}
          <div className="p-3 bg-[#FFFDF8] rounded-[6px] border border-[#DCDDD3]">
            <span className="text-[10px] font-mono uppercase font-bold text-[#028051] block mb-1">
              Phase 1 · Registration
            </span>
            <span className="text-xs font-mono font-semibold text-[#171914] block truncate">
              {formatDateDisplay(data.registrationStartsAt)}
            </span>
            <span className="text-[10px] text-[#6D7068] font-mono block mt-1">
              Closes: {formatDateDisplay(data.registrationEndsAt)}
            </span>
          </div>

          {/* Phase 2 */}
          <div className="p-3 bg-[#FFFDF8] rounded-[6px] border border-[#DCDDD3]">
            <span className="text-[10px] font-mono uppercase font-bold text-[#2563EB] block mb-1">
              Phase 2 · Hacking Window
            </span>
            <span className="text-xs font-mono font-semibold text-[#171914] block truncate">
              {formatDateDisplay(data.startsAt)}
            </span>
            <span className="text-[10px] text-[#6D7068] font-mono block mt-1">
              Submissions due: {formatDateDisplay(data.endsAt)}
            </span>
          </div>

          {/* Phase 3 */}
          <div className="p-3 bg-[#FFFDF8] rounded-[6px] border border-[#DCDDD3]">
            <span className="text-[10px] font-mono uppercase font-bold text-[#785A12] block mb-1">
              Phase 3 · Judging & Consensus
            </span>
            <span className="text-xs font-mono font-semibold text-[#171914] block truncate">
              Immediately upon cutoff
            </span>
            <span className="text-[10px] text-[#6D7068] font-mono block mt-1">
              Verifiable Merkle seal
            </span>
          </div>
        </div>
      </div>

      {/* Date Pickers Form */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase text-[#171914] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#028051]" />
          Configure Exact Phase Windows
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Registration Opens <span className="text-[#8B2C24]">*</span>
            </label>
            <Input
              type="datetime-local"
              value={data.registrationStartsAt ? data.registrationStartsAt.slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value ? new Date(e.target.value).toISOString() : '';
                onChange({ registrationStartsAt: val });
              }}
              className="w-full text-xs font-mono"
            />
            {errors.registrationStartsAt && (
              <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.registrationStartsAt}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Registration Closes <span className="text-[#8B2C24]">*</span>
            </label>
            <Input
              type="datetime-local"
              value={data.registrationEndsAt ? data.registrationEndsAt.slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value ? new Date(e.target.value).toISOString() : '';
                onChange({ registrationEndsAt: val });
              }}
              className="w-full text-xs font-mono"
            />
            {errors.registrationEndsAt && (
              <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.registrationEndsAt}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Hackathon Starts (Live Commits) <span className="text-[#8B2C24]">*</span>
            </label>
            <Input
              type="datetime-local"
              value={data.startsAt ? data.startsAt.slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value ? new Date(e.target.value).toISOString() : '';
                onChange({ startsAt: val });
              }}
              className="w-full text-xs font-mono"
            />
            {errors.startsAt && (
              <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.startsAt}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Hackathon Ends (Submission Hard Cutoff) <span className="text-[#8B2C24]">*</span>
            </label>
            <Input
              type="datetime-local"
              value={data.endsAt ? data.endsAt.slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value ? new Date(e.target.value).toISOString() : '';
                onChange({ endsAt: val });
              }}
              className="w-full text-xs font-mono"
            />
            {errors.endsAt && (
              <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.endsAt}</p>
            )}
          </div>
        </div>
      </div>

      {/* Validation Banner */}
      {(!isRegValid || !isHackathonValid || !isSequenceValid) &&
        (data.registrationStartsAt || data.startsAt) && (
          <div className="p-3 bg-[#FBE6E3] border border-[#F3C9B2] rounded-[8px] flex items-start gap-2.5 text-xs text-[#8B2C24] font-body">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#8B2C24] mt-0.5" />
            <div className="space-y-1">
              <strong className="font-heading font-bold">Invalid Date Combinations Detected:</strong>
              <ul className="list-disc list-inside text-[11px] font-mono space-y-0.5">
                {!isRegValid && (
                  <li>Registration opening must be strictly before registration closing.</li>
                )}
                {!isSequenceValid && (
                  <li>Registration closing must be on or before hackathon start time.</li>
                )}
                {!isHackathonValid && (
                  <li>Hackathon start time must be strictly before hackathon end cutoff.</li>
                )}
              </ul>
            </div>
          </div>
        )}
    </Card>
  );
};
