'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Clock, ShieldCheck, FileCode2, Users, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@almosthack/utils';
import { apiClient } from '../../lib/api-client';
import { NotificationEntity } from '@almosthack/types';

export interface NotificationCenterProps {
  className?: string;
}

const DEMO_NOTIFICATIONS: NotificationEntity[] = [
  {
    id: 'notif-1',
    userId: 'u-1',
    title: 'New submission received',
    body: 'QuantumQuest submitted project "ZeroKnowledge Climate Ledger" for Hack The Future 2026.',
    type: 'SUBMISSION_RECEIVED' as any,
    deliveryStatus: 'DELIVERED' as any,
    readAt: null,
    metadata: { team: 'QuantumQuest', track: 'AI' },
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'u-1',
    title: 'Judge evaluation completed',
    body: 'Dr. Sarah Lin submitted double-blind rubric evaluation for Sub-8492.',
    type: 'JUDGING_COMPLETED' as any,
    deliveryStatus: 'DELIVERED' as any,
    readAt: null,
    metadata: { judge: 'Dr. Sarah Lin', score: 87 },
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'u-1',
    title: 'Registration milestone reached',
    body: '800+ builders registered for Hack The Future 2026. Participant quota at 94%.',
    type: 'SYSTEM_ANNOUNCEMENT' as any,
    deliveryStatus: 'DELIVERED' as any,
    readAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    metadata: { count: 847 },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [notifications, setNotifications] = useState<NotificationEntity[]>(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'system'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch from API or fallback
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.getNotifications({ limit: 10 });
      if (res && res.items && res.items.length > 0) {
        setNotifications(res.items);
        setUnreadCount(res.meta?.unreadCount ?? 0);
      }
    } catch {
      // Use deterministic demo notifications in case backend is in mock mode
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside and Escape key dismissal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.markNotificationRead(id);
    } catch {
      // Offline fallback
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
    } catch {
      // Offline fallback
    }
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const filteredList = notifications.filter((n) => {
    if (filter === 'unread') return !n.readAt;
    if (filter === 'system') return String(n.type).includes('SYSTEM');
    return true;
  });

  const getIcon = (type: string) => {
    if (type.includes('SUBMISSION')) return <FileCode2 className="w-4 h-4 text-[#028051]" />;
    if (type.includes('JUDGING')) return <ShieldCheck className="w-4 h-4 text-[#785A12]" />;
    return <AlertCircle className="w-4 h-4 text-[#453860]" />;
  };

  const formatTime = (iso: Date | string) => {
    const timeMs = iso instanceof Date ? iso.getTime() : new Date(iso).getTime();
    const diff = Date.now() - timeMs;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Bell Trigger */}
      <button
        type="button"
        aria-label="View notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-[9px] text-[#6D7068] hover:text-[#171914] bg-[#FFFDF8] hover:bg-[#F7F4EA] border border-[#DCDDD3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold font-mono text-white bg-[#028051] rounded-full shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notification Center"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[16px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-50 overflow-hidden font-body text-left"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-[#DCDDD3] bg-[#F7F4EA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-extrabold text-[#171914]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0] rounded-[4px]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-mono text-[#028051] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-[#DCDDD3] px-3 py-1.5 gap-2 bg-[#FFFDF8] text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer',
                filter === 'all' ? 'bg-[#171914] text-white font-bold' : 'text-[#6D7068] hover:bg-[#F7F4EA]'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={cn(
                'px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer',
                filter === 'unread' ? 'bg-[#171914] text-white font-bold' : 'text-[#6D7068] hover:bg-[#F7F4EA]'
              )}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('system')}
              className={cn(
                'px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer',
                filter === 'system' ? 'bg-[#171914] text-white font-bold' : 'text-[#6D7068] hover:bg-[#F7F4EA]'
              )}
            >
              System
            </button>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F0ECE1]">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#6D7068]">
                No notifications in this view.
              </div>
            ) : (
              filteredList.map((item) => {
                const isUnread = !item.readAt;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isUnread) {
                        apiClient.markNotificationRead(item.id);
                        setUnreadCount((c) => Math.max(0, c - 1));
                      }
                      setIsOpen(false);
                      router.push('/notifications');
                    }}
                    className={cn(
                      'p-3.5 hover:bg-[#F7F4EA] transition-colors cursor-pointer flex items-start gap-3',
                      isUnread ? 'bg-[#FFFDF8]' : 'bg-[#FAF8F2]/60 opacity-85'
                    )}
                  >
                    <div className="w-8 h-8 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(String(item.type))}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-heading font-bold text-[#171914] truncate">
                          {item.title}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#028051] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#6D7068] font-body line-clamp-2 mt-0.5 leading-snug">
                        {item.body}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] font-mono text-[#9A9C94]">
                          {formatTime(item.createdAt)}
                        </span>
                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(item.id, e)}
                            className="text-[10px] font-mono text-[#028051] hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-[#DCDDD3] bg-[#F7F4EA] text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/notifications');
              }}
              className="w-full py-1.5 text-xs font-mono font-bold text-[#274535] hover:text-[#028051] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View full notification history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
