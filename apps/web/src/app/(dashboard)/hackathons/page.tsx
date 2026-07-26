'use client';

import React from 'react';
import { Breadcrumbs, HackathonCard, Button, Input } from '@almosthack/ui';
import { Search, Plus } from 'lucide-react';

export default function HackathonsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <Breadcrumbs items={[{ label: 'Platform' }, { label: 'Hackathons' }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">
              Hackathon Operating Shell
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Auditable lifecycle management from registration to verifiable payout.
            </p>
          </div>
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Create Hackathon
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-950/60 p-3 border border-zinc-800 rounded-lg">
        <div className="w-full sm:w-80">
          <Input placeholder="Filter by name, sponsor, or status..." leftIcon={<Search className="w-4 h-4 text-zinc-500" />} />
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <span>Filter:</span>
          <button className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-100 border border-zinc-700">All</button>
          <button className="px-2.5 py-1 rounded hover:bg-zinc-900 text-zinc-400">Live</button>
          <button className="px-2.5 py-1 rounded hover:bg-zinc-900 text-zinc-400">Judging</button>
          <button className="px-2.5 py-1 rounded hover:bg-zinc-900 text-zinc-400">Ended</button>
        </div>
      </div>

      {/* Hackathons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <HackathonCard
          id="h3"
          title="Stripe Payment Rails Hackathon"
          organization="Stripe Devs"
          prizePool={120000}
          participantsCount={2100}
          status="upcoming"
          startDate="Aug 01"
          endDate="Aug 05"
        />
      </div>
    </div>
  );
}
