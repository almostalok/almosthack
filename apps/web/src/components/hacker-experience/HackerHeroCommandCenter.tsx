'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { HackathonEntity } from '@almosthack/types';
import { HackerNextAction } from './hacker-types';

export interface HackerHeroCommandCenterProps {
  userName?: string;
  activeHackathon: HackathonEntity;
  hackathons: HackathonEntity[];
  onSelectHackathon: (id: string) => void;
  nextAction: HackerNextAction;
  onTriggerNextAction: () => void;
}

export const HackerHeroCommandCenter: React.FC<HackerHeroCommandCenterProps> = ({
  userName = 'Builder',
  activeHackathon,
  hackathons,
  onSelectHackathon,
  nextAction,
  onTriggerNextAction,
}) => {
  // Format deadline and compute remaining countdown
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const targetTime = new Date(activeHackathon.endsAt).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeHackathon.endsAt]);

  const deadlineFormatted = new Date(activeHackathon.endsAt).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }
  );

  return (
    <div className="p-6 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-6 text-left">
      {/* Top Greeting & Hackathon Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCDDD3] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#028051] font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              BUILDER WORKSPACE
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-[#DCDDD3]" />
            <span className="text-xs font-mono text-[#6D7068]">
              {activeHackathon.status}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight">
            Welcome back, {userName}
          </h1>
        </div>

        {/* Hackathon Switcher Dropdown */}
        {hackathons.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor="hackathon-switcher" className="text-xs font-mono text-[#6D7068]">
              Hackathon:
            </label>
            <select
              id="hackathon-switcher"
              value={activeHackathon.id}
              onChange={(e) => onSelectHackathon(e.target.value)}
              className="px-3 py-1.5 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] text-xs font-mono font-bold text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
            >
              {hackathons.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active Hackathon Info + Deadline Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Hackathon Title & Description */}
        <div className="md:col-span-7 space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#028051]" />
            <h2 className="text-lg font-heading font-extrabold text-[#171914]">
              {activeHackathon.name}
            </h2>
          </div>
          <p className="text-xs font-body text-[#6D7068] line-clamp-2">
            {activeHackathon.description || 'Welcome to your active hackathon workspace.'}
          </p>
        </div>

        {/* Deadline Counter Box */}
        <div className="md:col-span-5 p-3.5 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[#6D7068] uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#028051]" />
              Submission Deadline
            </span>
            <span className="text-xs font-mono font-bold text-[#171914] block">
              {deadlineFormatted}
            </span>
          </div>

          <div className="text-right font-mono">
            {timeLeft.isExpired ? (
              <span className="inline-flex items-center text-xs font-bold text-[#991B1B] px-2 py-0.5 rounded bg-[#FEE2E2] border border-[#FECACA]">
                Submission Closed
              </span>
            ) : (
              <div className="text-xs font-bold text-[#028051] bg-[#E2EBDD] border border-[#B8CEB0] px-2.5 py-1 rounded-[6px]">
                {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                {String(timeLeft.hours).padStart(2, '0')}h{' '}
                {String(timeLeft.minutes).padStart(2, '0')}m{' '}
                {String(timeLeft.seconds).padStart(2, '0')}s
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Next Action Banner */}
      <div
        className={`p-4 rounded-[10px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          nextAction.priority === 'URGENT'
            ? 'bg-[#FFF4DC] border-[#F0D597]'
            : 'bg-[#E2EBDD]/40 border-[#B8CEB0]'
        }`}
      >
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                nextAction.priority === 'URGENT'
                  ? 'bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B]'
                  : 'bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051]'
              }`}
            >
              NEXT ACTION
            </span>
            <h3 className="font-heading font-extrabold text-sm text-[#171914]">
              {nextAction.title}
            </h3>
          </div>
          <p className="text-xs font-body text-[#43463E]">
            {nextAction.description}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onTriggerNextAction}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-xs font-mono font-bold shrink-0 self-start sm:self-center"
        >
          {nextAction.actionLabel}
        </Button>
      </div>
    </div>
  );
};
