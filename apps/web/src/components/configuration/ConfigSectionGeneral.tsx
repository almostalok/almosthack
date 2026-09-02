'use client';

import React from 'react';
import { Card, Input } from '@almosthack/ui';
import { Globe, Clock, Building2, AlignLeft, MapPin } from 'lucide-react';
import { COMMON_TIMEZONES } from '../create-hackathon/StepBasicInfo';

export interface GeneralConfigData {
  name: string;
  slug: string;
  description: string;
  timezone: string;
  format: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  location: string;
  websiteUrl: string;
  logoUrl: string;
}

export interface ConfigSectionGeneralProps {
  data: GeneralConfigData;
  onChange: (data: Partial<GeneralConfigData>) => void;
  isLocked?: boolean;
}

export const ConfigSectionGeneral: React.FC<ConfigSectionGeneralProps> = ({
  data,
  onChange,
  isLocked = false,
}) => {
  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <h2 className="text-base font-heading font-extrabold text-[#171914]">
          General Event Settings & Branding
        </h2>
        <p className="text-xs text-[#6D7068] font-body mt-0.5">
          Event title, custom slug URL, timezone, and public-facing branding.
        </p>
      </div>

      <div className="space-y-4">
        {/* Name & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Hackathon Name <span className="text-[#8B2C24]">*</span>
            </label>
            <Input
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              disabled={isLocked}
              className="w-full text-xs font-heading font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Custom URL Slug
            </label>
            <Input
              value={data.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              disabled={isLocked}
              className="w-full text-xs font-mono"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#028051]" />
            Overview & Description
          </label>
          <textarea
            rows={3}
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            disabled={isLocked}
            className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-body rounded-[8px] p-3 focus:outline-none focus:border-[#028051] disabled:opacity-60"
          />
        </div>

        {/* Mode & Timezone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#028051]" />
              Event Mode
            </label>
            <select
              value={data.format}
              onChange={(e) => onChange({ format: e.target.value as any })}
              disabled={isLocked}
              className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] disabled:opacity-60"
            >
              <option value="ONLINE">Online / Virtual (Global)</option>
              <option value="IN_PERSON">In-Person (Physical)</option>
              <option value="HYBRID">Hybrid (Online + On-site)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#028051]" />
              Operating Timezone
            </label>
            <select
              value={data.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
              disabled={isLocked}
              className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] disabled:opacity-60"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        {data.format !== 'ONLINE' && (
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#028051]" />
              Venue Location
            </label>
            <Input
              value={data.location}
              onChange={(e) => onChange({ location: e.target.value })}
              disabled={isLocked}
              className="w-full text-xs font-body"
            />
          </div>
        )}

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Official Website URL
            </label>
            <Input
              type="url"
              value={data.websiteUrl}
              onChange={(e) => onChange({ websiteUrl: e.target.value })}
              disabled={isLocked}
              className="w-full text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Logo / Graphic URL
            </label>
            <Input
              type="url"
              value={data.logoUrl}
              onChange={(e) => onChange({ logoUrl: e.target.value })}
              disabled={isLocked}
              className="w-full text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
