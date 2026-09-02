'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '@/providers/auth-provider';
import { Megaphone, ArrowLeft } from 'lucide-react';
import { Breadcrumbs, Button } from '@almosthack/ui';
import { useAnnouncements } from './use-announcements';
import { AnnouncementSummaryCards } from './AnnouncementSummaryCards';
import { AnnouncementToolbar } from './AnnouncementToolbar';
import { AnnouncementTable } from './AnnouncementTable';
import { AnnouncementMobileCard } from './AnnouncementMobileCard';
import { CreateAnnouncementDialog } from './CreateAnnouncementDialog';
import { PublishAnnouncementDialog } from './PublishAnnouncementDialog';
import { ScheduleAnnouncementDialog } from './ScheduleAnnouncementDialog';
import { AnnouncementDetailModal } from './AnnouncementDetailModal';
import { AnnouncementEntity } from './announcements-types';

export interface AnnouncementsManagementViewProps {
  hackathonId: string;
}

export const AnnouncementsManagementView: React.FC<AnnouncementsManagementViewProps> = ({
  hackathonId,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const isOrganizer =
    user?.roles?.some((r) => r === 'ORGANIZER' || r === 'ADMIN') ?? true;

  // Fetch hackathon identity
  const { data: hackathon } = useQuery({
    queryKey: ['hackathon', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathon(hackathonId);
      } catch {
        return {
          id: hackathonId,
          name: 'Hack The Future 2026',
          slug: 'hack-the-future-2026',
          status: 'PUBLISHED',
        };
      }
    },
  });

  const {
    filters,
    updateFilters,
    tracks,
    announcements,
    filteredAnnouncements,
    metrics,
    isLoading,
    // Modals
    selectedAnnouncement,
    setSelectedAnnouncement,
    isCreateOpen,
    setIsCreateOpen,
    isPublishOpen,
    setIsPublishOpen,
    isScheduleOpen,
    setIsScheduleOpen,
    isDetailOpen,
    setIsDetailOpen,
    actionError,
    // Mutations
    createMutation,
    publishMutation,
    scheduleMutation,
    cancelMutation,
  } = useAnnouncements({ hackathonId });

  const breadcrumbs = [
    { label: 'Hackathons', href: '/hackathons' },
    { label: hackathon?.name || 'Workspace', href: `/hackathons/${hackathonId}` },
    { label: 'Announcements & Communication', active: true },
  ];

  const handleOpenDetail = (a: AnnouncementEntity) => {
    setSelectedAnnouncement(a);
    setIsDetailOpen(true);
  };

  const handleOpenPublish = (a: AnnouncementEntity) => {
    setSelectedAnnouncement(a);
    setIsPublishOpen(true);
  };

  const handleOpenSchedule = (a: AnnouncementEntity) => {
    setSelectedAnnouncement(a);
    setIsScheduleOpen(true);
  };

  const handleCancelSchedule = async (a: AnnouncementEntity) => {
    if (confirm('Cancel this scheduled announcement broadcast?')) {
      await cancelMutation.mutateAsync(a.id);
    }
  };

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Hackathon Communication & Announcements Workspace"
    >
      {/* Header */}
      <div className="space-y-4 pb-4 border-b border-[#DCDDD3]">
        <Breadcrumbs items={breadcrumbs} className="text-xs" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <Megaphone className="w-6 h-6 text-[#028051]" />
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
                Announcements & Communication
              </h1>
            </div>
            <p className="text-xs text-[#6D7068] font-body">
              Broadcast event updates, deadline extensions, judging notifications, and milestone alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/hackathons/${hackathonId}`)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8"
            >
              Workspace
            </Button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <AnnouncementSummaryCards metrics={metrics} />

      {/* Toolbar */}
      <AnnouncementToolbar
        filters={filters}
        onUpdateFilters={updateFilters}
        tracks={tracks}
        onCreateClick={() => setIsCreateOpen(true)}
        isOrganizer={isOrganizer}
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <AnnouncementTable
          announcements={filteredAnnouncements}
          onSelect={handleOpenDetail}
          onPublishClick={handleOpenPublish}
          onScheduleClick={handleOpenSchedule}
          onCancelClick={handleCancelSchedule}
          isOrganizer={isOrganizer}
        />
      </div>

      {/* Mobile Card Feed */}
      <div className="md:hidden space-y-3">
        {filteredAnnouncements.map((a) => (
          <AnnouncementMobileCard
            key={a.id}
            announcement={a}
            onSelect={handleOpenDetail}
            onPublishClick={handleOpenPublish}
            onScheduleClick={handleOpenSchedule}
            onCancelClick={handleCancelSchedule}
            isOrganizer={isOrganizer}
          />
        ))}
      </div>

      {/* Create Announcement Modal */}
      <CreateAnnouncementDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (dto, publishImmediately) => {
          const res = (await createMutation.mutateAsync(dto)) as any;
          if (publishImmediately && res?.id) {
            await publishMutation.mutateAsync(res.id);
          }
        }}
        tracks={tracks}
        isSubmitting={createMutation.isPending || publishMutation.isPending}
        error={actionError}
      />

      {/* Publish Modal */}
      <PublishAnnouncementDialog
        isOpen={isPublishOpen}
        announcement={selectedAnnouncement}
        onClose={() => {
          setIsPublishOpen(false);
          setSelectedAnnouncement(null);
        }}
        onConfirm={async () => {
          if (selectedAnnouncement) {
            await publishMutation.mutateAsync(selectedAnnouncement.id);
          }
        }}
        isSubmitting={publishMutation.isPending}
      />

      {/* Schedule Modal */}
      <ScheduleAnnouncementDialog
        isOpen={isScheduleOpen}
        announcement={selectedAnnouncement}
        onClose={() => {
          setIsScheduleOpen(false);
          setSelectedAnnouncement(null);
        }}
        onConfirm={async (scheduledAt) => {
          if (selectedAnnouncement) {
            await scheduleMutation.mutateAsync({
              announcementId: selectedAnnouncement.id,
              dto: { scheduledAt },
            });
          }
        }}
        isSubmitting={scheduleMutation.isPending}
      />

      {/* Detail Modal */}
      <AnnouncementDetailModal
        isOpen={isDetailOpen}
        announcement={selectedAnnouncement}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedAnnouncement(null);
        }}
        onPublishClick={handleOpenPublish}
        onScheduleClick={handleOpenSchedule}
        onCancelClick={handleCancelSchedule}
        isOrganizer={isOrganizer}
      />
    </div>
  );
};
