'use client';

import React from 'react';
import {
  MetricsCard,
  StatisticCard,
  HackathonCard,
  ActivityFeed,
  Timeline,
  CodeBlock,
  Badge,
  Breadcrumbs,
} from '@almosthack/ui';
import { Trophy, GitBranch, ShieldCheck, Users, Terminal } from 'lucide-react';

export default function OverviewPage() {
  const sampleActivities = [
    {
      id: '1',
      actor: 'dr_alex_v',
      action: 'submitted calibrated score for',
      target: 'Sub-8492 (Zero-Knowledge Ledger)',
      timeAgo: '2m ago',
      type: 'judge' as const,
    },
    {
      id: '2',
      actor: 'git-bot',
      action: 'verified commit tree SHA-256 for',
      target: 'almosthack/core-v1',
      timeAgo: '14m ago',
      type: 'commit' as const,
    },
    {
      id: '3',
      actor: 'system',
      action: 'minted audit log block',
      target: '#0x9a8f...3e21',
      timeAgo: '1h ago',
      type: 'audit' as const,
    },
  ];

  const sampleTimeline = [
    {
      id: 'm1',
      title: 'Phase 1: Registration & Team Formation',
      timestamp: 'Completed 12h ago',
      description: '1,420 builder profiles cryptographically identity-verified.',
      status: 'completed' as const,
    },
    {
      id: 'm2',
      title: 'Phase 2: Live Hacking & Code Commits',
      timestamp: 'In Progress',
      description: 'Real-time repository sync & integrity auditing.',
      status: 'current' as const,
    },
    {
      id: 'm3',
      title: 'Phase 3: Calibrated Double-Blind Judging',
      timestamp: 'Starts in 18h',
      description: 'Zero-bias consensus calculation & leaderboard seal.',
      status: 'upcoming' as const,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Breadcrumbs & Title */}
      <div className="flex flex-col gap-2">
        <Breadcrumbs items={[{ label: 'Platform' }, { label: 'Overview' }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">
              Platform Command Center
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Transparent audit stream & global hackathon telemetry preview.
            </p>
          </div>
          <Badge variant="accent" size="md">
            Demo Mode
          </Badge>
        </div>
      </div>

      {/* Metrics Row (Demo Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Active Hackathons"
          value="12"
          change="+25%"
          isPositive={true}
          icon={<Trophy className="w-4 h-4 text-amber-400" />}
          subtext="Demo Telemetry"
        />
        <MetricsCard
          title="Verified Builders"
          value="4,892"
          change="+18%"
          isPositive={true}
          icon={<Users className="w-4 h-4 text-cyan-400" />}
          subtext="Demo Telemetry"
        />
        <MetricsCard
          title="Synced Repositories"
          value="1,240"
          change="+32%"
          isPositive={true}
          icon={<GitBranch className="w-4 h-4 text-emerald-400" />}
          subtext="Demo Telemetry"
        />
        <MetricsCard
          title="Audit Ledger Blocks"
          value="98.9%"
          change="+0.4%"
          isPositive={true}
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          subtext="Demo Telemetry"
        />
      </div>

      {/* Main Grid: Hackathons & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Hackathons */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold font-heading uppercase tracking-wider text-zinc-300">
              Featured Transparencies (Preview)
            </h2>
            <span className="text-xs font-mono text-zinc-500">Showing 2 of 12</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HackathonCard
              id="h1"
              title="EthGlobal Transparency Sprint '26"
              organization="Ethereum Foundation"
              prizePool={150000}
              participantsCount={1280}
              status="live"
              startDate="Jul 22"
              endDate="Jul 25"
            />
            <HackathonCard
              id="h2"
              title="Vercel AI Infrastructure Hack"
              organization="Vercel Labs"
              prizePool={85000}
              participantsCount={940}
              status="judging"
              startDate="Jul 20"
              endDate="Jul 23"
            />
          </div>

          {/* Audit Verification Terminal Code Block */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Audit Verification Interface (Preview)
            </span>
            <CodeBlock
              filename="audit-verify.ts"
              language="typescript"
              code={`import { verifyLedgerBlock } from '@almosthack/utils';

// Preview audit hash verification interface
const isAudited = await verifyLedgerBlock({
  blockHash: "0x9a8f7c6b5a4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c",
  expectedMerkleRoot: "0x3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e",
});

console.log(\`[Audit Status] Ledger Seal Verified: \${isAudited}\`);`}
            />
          </div>
        </div>

        {/* Right Column: Live Stream & Timeline */}
        <div className="space-y-6">
          {/* Live Activity Feed */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <h3 className="text-xs font-semibold font-mono uppercase text-zinc-300 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Audit Stream
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> LIVE
              </span>
            </div>
            <ActivityFeed activities={sampleActivities} />
          </div>

          {/* Lifecycle Milestone Timeline */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-4 space-y-4">
            <h3 className="text-xs font-semibold font-mono uppercase text-zinc-300">
              Active Milestone Tracker
            </h3>
            <Timeline events={sampleTimeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
