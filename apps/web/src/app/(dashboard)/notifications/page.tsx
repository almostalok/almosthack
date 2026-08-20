'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { NotificationEntity, NotificationType, NotificationPreferenceEntity } from '@almosthack/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationEntity[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'ANNOUNCEMENT' | 'REMINDER' | 'RESULTS'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [preferences, setPreferences] = useState<NotificationPreferenceEntity | null>(null);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState<boolean>(false);
  const [isSavingPref, setIsSavingPref] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const query: any = { page, limit: 20 };

      if (activeTab === 'UNREAD') {
        query.unreadOnly = true;
      } else if (activeTab === 'ANNOUNCEMENT') {
        query.type = NotificationType.ANNOUNCEMENT;
      } else if (activeTab === 'REMINDER') {
        query.type = NotificationType.SUBMISSION_DEADLINE;
      } else if (activeTab === 'RESULTS') {
        query.type = NotificationType.RESULTS_PUBLISHED;
      }

      const res = await apiClient.getNotifications(query);
      setNotifications(res.items || []);
      setTotalPages(res.meta?.totalPages || 1);
      setUnreadCount(res.meta?.unreadCount || 0);
    } catch {
      // Failed to load
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await apiClient.getNotificationPreferences();
      setPreferences(res);
    } catch {
      // Failed to load
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, activeTab]);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Failed
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // Failed
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    try {
      setIsSavingPref(true);
      const updated = await apiClient.updateNotificationPreferences({
        inAppAnnouncements: preferences.inAppAnnouncements,
        inAppReminders: preferences.inAppReminders,
        inAppTeamUpdates: preferences.inAppTeamUpdates,
        inAppResults: preferences.inAppResults,
      });
      setPreferences(updated);
      setIsPrefModalOpen(false);
    } catch {
      // Failed
    } finally {
      setIsSavingPref(false);
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ANNOUNCEMENT:
        return <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">ANNOUNCEMENT</span>;
      case NotificationType.RESULTS_PUBLISHED:
        return <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">RESULTS</span>;
      case NotificationType.SUBMISSION_DEADLINE:
      case NotificationType.REGISTRATION_CLOSING:
        return <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">DEADLINE</span>;
      case NotificationType.TEAM_UPDATE:
        return <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">TEAM</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 rounded">{type}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time event updates, announcements, milestone reminders, and operational alerts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPrefModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-mono rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Preferences</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3.5 py-2 text-xs font-mono rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-1">
        {(['ALL', 'UNREAD', 'ANNOUNCEMENT', 'REMINDER', 'RESULTS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
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

      {/* Notification List */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-zinc-500">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-3 text-zinc-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-zinc-300">No notifications found</h3>
          <p className="text-xs text-zinc-500 mt-1">You are all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition-colors flex items-start justify-between gap-4 ${
                !n.readAt
                  ? 'border-emerald-500/30 bg-zinc-950/90 shadow-sm'
                  : 'border-zinc-800/80 bg-zinc-950/40 text-zinc-400'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2.5 mb-1.5">
                  {!n.readAt && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  )}
                  {getTypeBadge(n.type)}
                  <h3 className="text-sm font-semibold text-zinc-100">{n.title}</h3>
                </div>

                <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                  {n.body}
                </p>

                <div className="flex items-center space-x-4 mt-3 text-[10px] font-mono text-zinc-500">
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                  {n.readAt && (
                    <span className="text-zinc-600">Read on {new Date(n.readAt).toLocaleString()}</span>
                  )}
                </div>
              </div>

              {!n.readAt && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-500/30 rounded bg-zinc-900 transition-colors shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-xs font-mono rounded border border-zinc-800 bg-zinc-900 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800"
          >
            ← Previous
          </button>
          <span className="text-xs font-mono text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 text-xs font-mono rounded border border-zinc-800 bg-zinc-900 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800"
          >
            Next →
          </button>
        </div>
      )}

      {/* Preferences Modal */}
      {isPrefModalOpen && preferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Notification Preferences</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Customize which in-app notification categories you wish to receive.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Organizer Announcements</div>
                  <div className="text-[10px] text-zinc-400">Important broadcasts from hackathon hosts</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inAppAnnouncements}
                  onChange={(e) =>
                    setPreferences({ ...preferences, inAppAnnouncements: e.target.checked })
                  }
                  className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Milestone & Deadline Reminders</div>
                  <div className="text-[10px] text-zinc-400">Submission and registration closing alerts</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inAppReminders}
                  onChange={(e) =>
                    setPreferences({ ...preferences, inAppReminders: e.target.checked })
                  }
                  className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Team Updates</div>
                  <div className="text-[10px] text-zinc-400">Team invitations and submission status changes</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inAppTeamUpdates}
                  onChange={(e) =>
                    setPreferences({ ...preferences, inAppTeamUpdates: e.target.checked })
                  }
                  className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Results & Leaderboard</div>
                  <div className="text-[10px] text-zinc-400">Official winner and score publication alerts</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inAppResults}
                  onChange={(e) =>
                    setPreferences({ ...preferences, inAppResults: e.target.checked })
                  }
                  className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsPrefModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                disabled={isSavingPref}
                onClick={handleSavePreferences}
                className="px-4 py-1.5 text-xs font-mono rounded bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                {isSavingPref ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
