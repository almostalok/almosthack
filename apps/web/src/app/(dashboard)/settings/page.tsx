'use client';

import React from 'react';
import { Breadcrumbs, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Input } from '@almosthack/ui';
import { ShieldCheck, Palette, Lock, Key } from 'lucide-react';
import { RoleName, ROLE_PERMISSIONS } from '@almosthack/types';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col gap-2">
        <Breadcrumbs items={[{ label: 'Platform' }, { label: 'Settings & RBAC' }]} />
        <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">
          System Configuration & RBAC Engine
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Config Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase">
                <Palette className="w-4 h-4 text-emerald-400" /> Accent Token Config
              </CardTitle>
              <CardDescription>Configure single accent color token across entire design system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-emerald-500 border border-emerald-400 cursor-pointer ring-2 ring-emerald-500/30" />
                <span className="w-6 h-6 rounded bg-cyan-500 border border-cyan-400 cursor-pointer" />
                <span className="w-6 h-6 rounded bg-zinc-100 border border-zinc-300 cursor-pointer" />
              </div>
              <Input label="CUSTOM ACCENT HEX" defaultValue="#10B981" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase">
                <Key className="w-4 h-4 text-amber-400" /> OAuth & Credentials
              </CardTitle>
              <CardDescription>Managed provider single sign-on configurations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-zinc-900 rounded border border-zinc-800 text-xs font-mono">
                <span>GitHub OAuth Provider</span>
                <Badge variant="accent">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-900 rounded border border-zinc-800 text-xs font-mono">
                <span>Google Enterprise SSO</span>
                <Badge variant="accent">Connected</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Complete RBAC Matrix Inspector */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Role-Based Access Control (RBAC) Matrix
              </CardTitle>
              <CardDescription>
                Declarative permission matrix governing Admin, Organizer, Judge, Participant, Mentor, and Sponsor actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
                <div key={role} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-zinc-100 uppercase">{role}</span>
                    <span className="text-[11px] font-mono text-zinc-500">{perms.length} Permissions Allowed</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {perms.map((p) => (
                      <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
