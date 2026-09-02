'use client';

import React from 'react';
import { Card, Input } from '@almosthack/ui';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

export interface ScheduleConfigData {
  registrationStartsAt: string;
  registrationEndsAt: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
}

export interface ConfigSectionScheduleProps {
  data: ScheduleConfigData;
  onChange: (data: Partial<ScheduleConfigData>) => void;
  isLocked?: boolean;
}

export const ConfigSectionSchedule: React.FC<ConfigSectionScheduleProps> = ({
  data,
  onChange,
  isLocked = false,
}) => {
  const isRegValid =
    !data.registrationStartsAt ||
    !data.registrationEndsAt ||
    new Date(data.registrationStartsAt).getTime() < new Date(data.registrationEndsAt).getTime();

  const isHackathonValid =
    !data.startsAt ||
    !data.endsAt ||
    new Date(data.startsAt).getTime() < new Date(data.endsAt).getTime();

  const isSequenceValid =
    !data.registrationEndsAt ||
    !data.startsAt ||
    new Date(data.registrationEndsAt).getTime() <= new Date(data.startsAt).getTime();

  const formatDateDisplay = (isoStr: string) => {
    if (!isoStr) return 'Not set';
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
        <h2 className="text-base font-heading font-extrabold text-[#171914]">
          Schedule & Operational Windows
        </h2>
        <p className="text-xs text-[#6D7068] font-body mt-0.5">
          Registration openings, hacking commit windows, and hard submission deadlines in{' '}
          <span className="font-mono text-[#028051] font-bold">{data.timezone}</span>.
        </p>
      </div>

      {/* Visual Sequence */}
      <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-2.5">
        <h3 className="text-[11px] font-mono font-bold uppercase text-[#6D7068]">
          Lifecycle Timeline Preview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-2.5 bg-[#FFFDF8] rounded-[6px] border border-[#DCDDD3]">
            <span className="text-[#028051] font-bold block mb-1">Registration Window</span>
            <span className="text-[#171914] block truncate">
              {formatDateDisplay(data.registrationStartsAt)} → {formatDateDisplay(data.registrationEndsAt)}
            </span>
          </div>
          <div className="p-2.5 bg-[#FFFDF8] rounded-[6px] border border-[#DCDDD3]">
            <span className="text-[#2563EB] font-bold block mb-1">Hacking Window</span>
            <span className="text-[#171914] block truncate">
              {formatDateDisplay(data.startsAt)} → {formatDateDisplay(data.endsAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Registration Opens
            </label>
            <Input
              type="datetime-local"
              value={data.registrationStartsAt ? data.registrationStartsAt.slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value ? new Date(e.target.value).toISOString() : '';
                onChange({ registrationStartsAt: val });
              }}
              disabled={isLocked}
              className="w-full text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Registration Closes
            </label>
            <Input
              type="datetime-local"
              value={data.registrationEndsAt ? data.registrationEndsAt.slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value ? new Date(e.target.value).toISOString() : '';
                onChange({ registrationEndsAt: val });
              }}
              disabled={isLocked}
              className="w-full text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Hackathon Starts (Live Sync)
            </label>
            <Input
              type="datetime-local"
              value={data.startsAt ? data.startsAt.slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value ? new Date(e.target.value).toISOString() : '';
                onChange({ startsAt: val });
              }}
              disabled={isLocked}
              className="w-full text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Hackathon Ends (Cutoff)
            </label>
            <Input
              type="datetime-local"
              value={data.endsAt ? data.endsAt.slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value ? new Date(e.target.value).toISOString() : '';
                onChange({ endsAt: val });
              }}
              disabled={isLocked}
              className="w-full text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {(!isRegValid || !isHackathonValid || !isSequenceValid) && (
        <div className="p-3 bg-[#FBE6E3] border border-[#F3C9B2] rounded-[8px] flex items-center gap-2 text-xs text-[#8B2C24] font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Invalid date sequence detected. Please check timestamps.</span>
        </div>
      )}
    </Card>
  );
};
