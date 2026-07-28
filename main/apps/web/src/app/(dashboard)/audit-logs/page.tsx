'use client';

import React from 'react';
import { Breadcrumbs, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '@almosthack/ui';
import { ShieldCheck, Download, ExternalLink } from 'lucide-react';

export default function AuditLogsPage() {
  const logs = [
    {
      id: 'log_98a7f6',
      actor: 'dr_alex_v@almosthack.io',
      action: 'judging.score_submitted',
      target: 'Submission #8492',
      ip: '192.168.1.104',
      checksum: '0x9a8f7c6b5a4e3d2c1b0a',
      time: '2026-07-22 22:14:02 UTC',
    },
    {
      id: 'log_43b2c1',
      actor: 'system.ledger',
      action: 'hackathon.published',
      target: 'EthGlobal Sprint',
      ip: '10.0.0.12',
      checksum: '0x3f2e1d0c9b8a7f6e5d4c',
      time: '2026-07-22 21:40:15 UTC',
    },
    {
      id: 'log_12f8e9',
      actor: 'marcus.chen@vercel.com',
      action: 'repo.commit_audited',
      target: 'next-audit-plugin',
      ip: '172.16.0.45',
      checksum: '0x7b6a5f4e3d2c1b0a9f8e',
      time: '2026-07-22 20:12:33 UTC',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <Breadcrumbs items={[{ label: 'Platform' }, { label: 'Verifiable Audit Ledger' }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">
              Verifiable System Ledger
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Append-only immutable audit trail for every platform event and score submission.
            </p>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export Audit Proof
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event ID</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target Entity</TableHead>
            <TableHead>SHA-256 Checksum</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-emerald-400 font-bold">{log.id}</TableCell>
              <TableCell>{log.actor}</TableCell>
              <TableCell>
                <Badge variant="audit">{log.action}</Badge>
              </TableCell>
              <TableCell>{log.target}</TableCell>
              <TableCell className="text-zinc-500 font-mono text-[11px]">{log.checksum}</TableCell>
              <TableCell className="text-zinc-400">{log.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
