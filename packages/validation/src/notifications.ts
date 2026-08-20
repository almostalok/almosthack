import { z } from 'zod';
import {
  NotificationType,
  AnnouncementStatus,
  AnnouncementRecipientScope,
} from '@almosthack/types';

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  body: z.string().min(5, 'Body must be at least 5 characters').max(10000, 'Body cannot exceed 10,000 characters'),
  recipientScope: z.nativeEnum(AnnouncementRecipientScope).optional().default(AnnouncementRecipientScope.ALL_PARTICIPANTS),
  targetTrackId: z.string().uuid('Invalid track ID format').optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters').optional(),
  body: z.string().min(5, 'Body must be at least 5 characters').max(10000, 'Body cannot exceed 10,000 characters').optional(),
  recipientScope: z.nativeEnum(AnnouncementRecipientScope).optional(),
  targetTrackId: z.string().uuid('Invalid track ID format').optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export const scheduleAnnouncementSchema = z.object({
  scheduledAt: z.string().datetime({ message: 'scheduledAt must be a valid ISO 8601 UTC timestamp string' })
    .refine((val) => new Date(val).getTime() > Date.now(), {
      message: 'scheduledAt must be a timestamp in the future',
    }),
});

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().optional(),
  type: z.nativeEnum(NotificationType).optional(),
  hackathonId: z.string().uuid().optional(),
});

export const announcementListQuerySchema = z.object({
  status: z.nativeEnum(AnnouncementStatus).optional(),
  targetTrackId: z.string().uuid().optional(),
});

export const updateNotificationPreferenceSchema = z.object({
  inAppAnnouncements: z.boolean().optional(),
  inAppReminders: z.boolean().optional(),
  inAppTeamUpdates: z.boolean().optional(),
  inAppResults: z.boolean().optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type ScheduleAnnouncementInput = z.infer<typeof scheduleAnnouncementSchema>;
export type NotificationListQueryInput = z.infer<typeof notificationListQuerySchema>;
export type AnnouncementListQueryInput = z.infer<typeof announcementListQuerySchema>;
export type UpdateNotificationPreferenceInput = z.infer<typeof updateNotificationPreferenceSchema>;
