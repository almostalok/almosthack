'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';
import {
  AnnouncementEntity,
  AnnouncementStatus,
  AnnouncementRecipientScope,
} from '@almosthack/types';

export default function HackathonAnnouncementsPage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = params?.hackathonId as string;
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<AnnouncementEntity[]>([]);
  const [hackathon, setHackathon] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOrganizer, setIsOrganizer] = useState<boolean>(false);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementEntity | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
    targetTrackId: '',
  });
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [hRes, aRes] = await Promise.all([
        apiClient.getHackathon(hackathonId),
        apiClient.getAnnouncements(hackathonId),
      ]);
      setHackathon(hRes);
      setTracks(hRes?.tracks || []);
      setAnnouncements(aRes || []);

      // Check if user is organizer
      const isOrgRole = user?.roles.some((r) => r === 'ORGANIZER' || r === 'ADMIN');
      setIsOrganizer(Boolean(isOrgRole));
    } catch {
      // Failed to load
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hackathonId) {
      fetchData();
    }
  }, [hackathonId]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      setIsSubmitting(true);
      await apiClient.createAnnouncement(hackathonId, {
        title: formData.title,
        body: formData.body,
        recipientScope: formData.recipientScope,
        targetTrackId: formData.targetTrackId || undefined,
      });
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        body: '',
        recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
        targetTrackId: '',
      });
      fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishNow = async (announcementId: string) => {
    if (!confirm('Are you sure you want to publish this announcement now? In-app notifications will be sent immediately.')) {
      return;
    }
    try {
      await apiClient.publishAnnouncement(hackathonId, announcementId);
      fetchData();
    } catch (err: any) {
      alert(`Publish failed: ${err.message}`);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      await apiClient.scheduleAnnouncement(hackathonId, selectedAnnouncement.id, {
        scheduledAt: new Date(scheduleDate).toISOString(),
      });
      setIsScheduleModalOpen(false);
      setSelectedAnnouncement(null);
      fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to schedule announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSchedule = async (announcementId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled announcement?')) {
      return;
    }
    try {
      await apiClient.cancelAnnouncement(hackathonId, announcementId);
      fetchData();
    } catch (err: any) {
      alert(`Cancel failed: ${err.message}`);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (activeTab === 'ALL') return true;
    return a.status === activeTab;
  });

  const getStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case AnnouncementStatus.PUBLISHED:
        return <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">PUBLISHED</span>;
      case AnnouncementStatus.SCHEDULED:
        return <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">SCHEDULED</span>;
      case AnnouncementStatus.DRAFT:
        return <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 rounded">DRAFT</span>;
      case AnnouncementStatus.CANCELLED:
        return <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">CANCELLED</span>;
    }
  };

  const getScopeBadge = (scope: AnnouncementRecipientScope) => {
    return <span className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 rounded">{scope}</span>;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Back Link */}
      <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
        <button
          onClick={() => router.push(`/hackathons/${hackathonId}`)}
          className="hover:text-zinc-300 transition-colors"
        >
          ← Back to Hackathon
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Announcements</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Official communications and operational updates for <span className="text-zinc-200">{hackathon?.name || 'this event'}</span>.
          </p>
        </div>

        {isOrganizer && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {/* Filter Tabs (Organizers see all tabs, participants see published only) */}
      {isOrganizer && (
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-1">
          {['ALL', 'PUBLISHED', 'SCHEDULED', 'DRAFT', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-zinc-800 text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Announcements Feed */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-zinc-500">
          Loading announcements...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-3 text-zinc-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-zinc-300">No announcements yet</h3>
          <p className="text-xs text-zinc-500 mt-1">Check back later for event updates and milestones.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-5 space-y-3 hover:border-zinc-700/80 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-900 pb-3">
                <div className="flex items-center space-x-2.5">
                  {getStatusBadge(a.status)}
                  {getScopeBadge(a.recipientScope)}
                  <h3 className="text-base font-semibold text-zinc-100">{a.title}</h3>
                </div>

                <div className="text-[10px] font-mono text-zinc-500">
                  {a.publishedAt ? (
                    <span>Published {new Date(a.publishedAt).toLocaleString()}</span>
                  ) : a.scheduledAt ? (
                    <span className="text-blue-400">Scheduled for {new Date(a.scheduledAt).toLocaleString()}</span>
                  ) : (
                    <span>Created {new Date(a.createdAt).toLocaleString()}</span>
                  )}
                </div>
              </div>

              <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
                {a.body}
              </p>

              {isOrganizer && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60 text-xs font-mono">
                  <div className="text-zinc-500 text-[10px]">
                    Author: {a.author?.name || a.author?.email || 'Organizer'} · v{a.version}
                  </div>

                  <div className="flex items-center space-x-2">
                    {a.status === AnnouncementStatus.DRAFT && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAnnouncement(a);
                            setIsScheduleModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 rounded"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => handlePublishNow(a.id)}
                          className="px-2.5 py-1 text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded font-bold"
                        >
                          Publish Now
                        </button>
                      </>
                    )}

                    {a.status === AnnouncementStatus.SCHEDULED && (
                      <>
                        <button
                          onClick={() => handleCancelSchedule(a.id)}
                          className="px-2.5 py-1 text-xs border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded"
                        >
                          Cancel Schedule
                        </button>
                        <button
                          onClick={() => handlePublishNow(a.id)}
                          className="px-2.5 py-1 text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded font-bold"
                        >
                          Publish Immediately
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Create New Announcement</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Draft a broadcast communication to participants, teams, judges, or organizers.
              </p>
            </div>

            {actionError && (
              <div className="p-3 text-xs font-mono bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Hacking Window Begins in 30 Minutes!"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Recipient Scope</label>
                <select
                  value={formData.recipientScope}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientScope: e.target.value as AnnouncementRecipientScope,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value={AnnouncementRecipientScope.ALL_PARTICIPANTS}>All Participants</option>
                  <option value={AnnouncementRecipientScope.ALL_TEAMS}>All Active Teams</option>
                  <option value={AnnouncementRecipientScope.ALL_JUDGES}>All Judges</option>
                  <option value={AnnouncementRecipientScope.ALL_ORGANIZERS}>All Organizers</option>
                  <option value={AnnouncementRecipientScope.TRACK}>Specific Track</option>
                </select>
              </div>

              {formData.recipientScope === AnnouncementRecipientScope.TRACK && (
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Select Track</label>
                  <select
                    value={formData.targetTrackId}
                    onChange={(e) => setFormData({ ...formData, targetTrackId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
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

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Message Body</label>
                <textarea
                  required
                  rows={5}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Type your announcement details here..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-mono rounded bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Draft...' : 'Save Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Announcement Modal */}
      {isScheduleModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Schedule Announcement</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Select a future date and time to automatically broadcast this announcement.
              </p>
            </div>

            {actionError && (
              <div className="p-3 text-xs font-mono bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Publication Time (Local / UTC)</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-mono rounded bg-blue-500 text-black font-bold hover:bg-blue-400 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Set Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
