'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  X,
  Sparkles,
  Users,
  Send,
  FileEdit,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import {
  AnnouncementRecipientScope,
  CreateAnnouncementDto,
  AnnouncementTemplate,
} from './announcements-types';
import { OPERATIONAL_TEMPLATES } from './announcements-mock-data';
import { HackathonTrackEntity } from '@almosthack/types';

export interface CreateAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateAnnouncementDto, publishImmediately?: boolean) => Promise<void>;
  tracks: HackathonTrackEntity[];
  isSubmitting?: boolean;
  error?: string | null;
}

export const CreateAnnouncementDialog: React.FC<CreateAnnouncementDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tracks,
  isSubmitting = false,
  error,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recipientScope, setRecipientScope] = useState<AnnouncementRecipientScope>(
    AnnouncementRecipientScope.ALL_PARTICIPANTS
  );
  const [targetTrackId, setTargetTrackId] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (template: AnnouncementTemplate) => {
    setTitle(template.title);
    setBody(template.body);
    setRecipientScope(template.scope);
  };

  const getRecipientEstimate = () => {
    switch (recipientScope) {
      case AnnouncementRecipientScope.ALL_PARTICIPANTS:
        return '1,080 verified participants';
      case AnnouncementRecipientScope.ALL_TEAMS:
        return '136 active team rosters (684 builders)';
      case AnnouncementRecipientScope.ALL_JUDGES:
        return '4 domain reviewers & track leads';
      case AnnouncementRecipientScope.ALL_ORGANIZERS:
        return '3 organization admins & track leads';
      case AnnouncementRecipientScope.TRACK:
        return '42 teams in selected track (~168 participants)';
    }
  };

  const handleSubmit = async (publishImmediately: boolean) => {
    if (!title.trim() || !body.trim()) return;

    await onSubmit(
      {
        title: title.trim(),
        body: body.trim(),
        recipientScope,
        targetTrackId:
          recipientScope === AnnouncementRecipientScope.TRACK && targetTrackId
            ? targetTrackId
            : undefined,
      },
      publishImmediately
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-announcement-title"
    >
      <div className="w-full max-w-2xl bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-2xl p-6 text-left space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] border border-[#B8CEB0] flex items-center justify-center text-[#028051]">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="create-announcement-title"
                className="text-base font-heading font-extrabold text-[#171914]"
              >
                Compose Hackathon Announcement
              </h2>
              <p className="text-[11px] text-[#6D7068] font-body">
                Broadcast official communications, deadline extensions, or judging alerts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-[6px] text-xs font-mono text-[#991B1B] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Operational Templates */}
        <div className="space-y-1.5 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[8px] p-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#171914]">
            <Sparkles className="w-3.5 h-3.5 text-[#028051]" />
            <span>Quick Operational Templates</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {OPERATIONAL_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="text-[11px] font-mono px-2 py-1 rounded bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] hover:border-[#028051] hover:text-[#028051] transition-colors cursor-pointer"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-[#171914] block">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Final 6 Hours: Submission Window Closing Tonight at 11:59 PM UTC"
              className="w-full px-3 py-2 text-xs font-body bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-[#171914] focus:outline-none focus:border-[#028051]"
            />
          </div>

          {/* Recipient Audience & Track */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-[#171914] block">
                Target Audience *
              </label>
              <select
                value={recipientScope}
                onChange={(e) =>
                  setRecipientScope(e.target.value as AnnouncementRecipientScope)
                }
                className="w-full px-3 py-2 text-xs font-mono bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
              >
                <option value={AnnouncementRecipientScope.ALL_PARTICIPANTS}>
                  All Participants
                </option>
                <option value={AnnouncementRecipientScope.ALL_TEAMS}>
                  All Active Teams
                </option>
                <option value={AnnouncementRecipientScope.ALL_JUDGES}>
                  All Reviewers / Judges
                </option>
                <option value={AnnouncementRecipientScope.ALL_ORGANIZERS}>
                  All Organizers
                </option>
                <option value={AnnouncementRecipientScope.TRACK}>
                  Specific Track
                </option>
              </select>
            </div>

            {recipientScope === AnnouncementRecipientScope.TRACK && (
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-[#171914] block">
                  Select Track *
                </label>
                <select
                  value={targetTrackId}
                  onChange={(e) => setTargetTrackId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
                >
                  <option value="">-- Choose Track --</option>
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Recipient Estimation Preview */}
          <div className="p-2.5 bg-[#FFF4DC] border border-[#F0D597] rounded-[6px] flex items-center justify-between text-xs font-mono text-[#785A12]">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Target Delivery Reach:</span>
            </div>
            <span className="font-bold">{getRecipientEstimate()}</span>
          </div>

          {/* Message Body & Preview Toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-[#171914]">
                Message Body *
              </label>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-[11px] font-mono text-[#028051] hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                {previewMode ? 'Edit Text' : 'Preview Message'}
              </button>
            </div>

            {previewMode ? (
              <div className="p-4 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] whitespace-pre-line min-h-[140px] leading-relaxed">
                {body || '(No message content entered yet)'}
              </div>
            ) : (
              <textarea
                required
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your announcement details, instructions, or meeting links..."
                className="w-full px-3 py-2 text-xs font-body bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051] leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#DCDDD3]">
          <span className="text-[11px] font-mono text-[#6D7068]">
            * Drafts can be reviewed or scheduled before broadcast
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={isSubmitting || !title || !body}
              onClick={() => handleSubmit(false)}
              className="text-xs font-mono"
            >
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting || !title || !body}
              onClick={() => handleSubmit(true)}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="text-xs font-mono bg-[#028051] hover:bg-[#026b44] text-[#FFFDF8] font-bold"
            >
              {isSubmitting ? 'Broadcasting...' : 'Broadcast Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
