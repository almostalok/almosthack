'use client';

import React from 'react';
import { Input, Card } from '@almosthack/ui';
import { Building2, Globe, MapPin, Clock, AlignLeft } from 'lucide-react';

export const COMMON_TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
];

export interface StepBasicInfoData {
  name: string;
  slug: string;
  organizationId: string;
  description: string;
  format: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  location: string;
  timezone: string;
  websiteUrl: string;
  logoUrl: string;
}

export interface StepBasicInfoProps {
  data: StepBasicInfoData;
  onChange: (data: Partial<StepBasicInfoData>) => void;
  organizations: Array<{ id: string; name: string }>;
  errors: Record<string, string>;
}

export const StepBasicInfo: React.FC<StepBasicInfoProps> = ({
  data,
  onChange,
  organizations,
  errors,
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const generatedSlug = newName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    onChange({
      name: newName,
      slug: data.slug === '' || data.slug === data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        ? generatedSlug
        : data.slug,
    });
  };

  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#171914]">
          Step 1: Event Identity & Organization
        </h2>
        <p className="text-xs text-[#6D7068] font-body mt-0.5">
          Provide primary naming, host organization, and event discovery metadata.
        </p>
      </div>

      <div className="space-y-4">
        {/* Organization Selector */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#028051]" />
            Host Organization <span className="text-[#8B2C24]">*</span>
          </label>
          {organizations.length > 0 ? (
            <select
              value={data.organizationId}
              onChange={(e) => onChange({ organizationId: e.target.value })}
              className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051]"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-[#FFF4DC] border border-[#F0D597] rounded-[8px] text-xs text-[#785A12] font-mono">
              Loading user organizations...
            </div>
          )}
          {errors.organizationId && (
            <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.organizationId}</p>
          )}
        </div>

        {/* Hackathon Name */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
            Hackathon Name <span className="text-[#8B2C24]">*</span>
          </label>
          <Input
            placeholder="e.g. AlmostHack Global Sprint 2026"
            value={data.name}
            onChange={handleNameChange}
            maxLength={100}
            className="w-full text-sm font-heading"
          />
          <div className="flex justify-between items-center mt-1 text-[10px] font-mono text-[#6D7068]">
            <span>Must be between 2 and 100 characters.</span>
            <span>{data.name.length}/100</span>
          </div>
          {errors.name && <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.name}</p>}
        </div>

        {/* Slug identifier */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
            Event URL Slug <span className="text-[#6D7068] font-normal">(Custom link)</span>
          </label>
          <div className="flex items-center rounded-[8px] border border-[#DCDDD3] bg-[#F7F4EA] overflow-hidden focus-within:border-[#028051] focus-within:ring-1 focus-within:ring-[#028051]">
            <span className="px-3 py-2 text-xs font-mono text-[#6D7068] select-none border-r border-[#DCDDD3]">
              almosthack.com/hackathons/
            </span>
            <input
              type="text"
              value={data.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              placeholder="almosthack-sprint-2026"
              className="w-full bg-transparent px-3 py-2 text-xs font-mono text-[#171914] focus:outline-none"
            />
          </div>
          {errors.slug && <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.slug}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#028051]" />
            Event Overview & Purpose
          </label>
          <textarea
            rows={3}
            placeholder="Briefly describe the theme, goals, and who should build..."
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            maxLength={2000}
            className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-body rounded-[8px] p-3 focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051]"
          />
          <div className="flex justify-between items-center mt-0.5 text-[10px] font-mono text-[#6D7068]">
            <span>Markdown supported. Max 2,000 characters.</span>
            <span>{data.description.length}/2000</span>
          </div>
          {errors.description && (
            <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.description}</p>
          )}
        </div>

        {/* Event Mode & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#028051]" />
              Event Mode
            </label>
            <select
              value={data.format}
              onChange={(e) => onChange({ format: e.target.value as any })}
              className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051]"
            >
              <option value="ONLINE">Online / Virtual (Global)</option>
              <option value="IN_PERSON">In-Person (On-site)</option>
              <option value="HYBRID">Hybrid (Online + On-site)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#028051]" />
              Operating Timezone <span className="text-[#8B2C24]">*</span>
            </label>
            <select
              value={data.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
              className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051]"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.timezone}</p>
            )}
          </div>
        </div>

        {data.format !== 'ONLINE' && (
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#028051]" />
              Venue / Physical Location
            </label>
            <Input
              placeholder="e.g. Bangalore International Exhibition Centre, Hall 3"
              value={data.location}
              onChange={(e) => onChange({ location: e.target.value })}
              className="w-full text-xs font-body"
            />
          </div>
        )}

        {/* External Website & Logo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Official Website URL <span className="text-[#6D7068] font-normal">(Optional)</span>
            </label>
            <Input
              type="url"
              placeholder="https://hackathon.example.com"
              value={data.websiteUrl}
              onChange={(e) => onChange({ websiteUrl: e.target.value })}
              className="w-full text-xs font-mono"
            />
            {errors.websiteUrl && (
              <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.websiteUrl}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5">
              Logo / Banner URL <span className="text-[#6D7068] font-normal">(Optional)</span>
            </label>
            <Input
              type="url"
              placeholder="https://cdn.example.com/logo.png"
              value={data.logoUrl}
              onChange={(e) => onChange({ logoUrl: e.target.value })}
              className="w-full text-xs font-mono"
            />
            {errors.logoUrl && (
              <p className="text-[11px] text-[#8B2C24] font-mono mt-1">{errors.logoUrl}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
