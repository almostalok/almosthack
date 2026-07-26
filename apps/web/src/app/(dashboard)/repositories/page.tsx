'use client';

import React from 'react';
import { Breadcrumbs, RepositoryCard, Input, Badge } from '@almosthack/ui';
import { Search, GitBranch } from 'lucide-react';

export default function RepositoriesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <Breadcrumbs items={[{ label: 'Platform' }, { label: 'Repository Intelligence' }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">
              Repository Audit Stream
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Continuous commit auditing, license compliance, and submission authenticity.
            </p>
          </div>
          <Badge variant="audit" size="md" className="gap-1">
            <GitBranch className="w-3.5 h-3.5" /> SHA-256 Verified
          </Badge>
        </div>
      </div>

      <div className="w-full max-w-md">
        <Input placeholder="Search repository by owner, repo name, or commit SHA..." leftIcon={<Search className="w-4 h-4 text-zinc-500" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RepositoryCard
          owner="almosthack-devs"
          name="zero-knowledge-verifier"
          description="High-performance zk-SNARK validator implementation for hackathon submission verification."
          stars={428}
          commitHash="a8f7c6b5a4e3d2c1b0a9"
          verifiedAudit={true}
          language="Rust"
        />
        <RepositoryCard
          owner="vercel-community"
          name="next-audit-plugin"
          description="Automated telemetry and build verification middleware for Next.js App Router."
          stars={192}
          commitHash="9f8e7d6c5b4a3f2e1d0c"
          verifiedAudit={true}
          language="TypeScript"
        />
        <RepositoryCard
          owner="linear-hackers"
          name="calibrated-consensus-engine"
          description="Fair ranking algorithm with outlier filtering for high-density multi-judge scoring."
          stars={84}
          commitHash="3f2e1d0c9b8a7f6e5d4c"
          verifiedAudit={true}
          language="Python"
        />
      </div>
    </div>
  );
}
