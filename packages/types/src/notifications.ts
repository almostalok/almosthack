/**
 * S6: Event Operations, Communications & Notifications Types
 */

export enum NotificationType {
  HACKATHON_PUBLISHED = 'HACKATHON_PUBLISHED',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSING = 'REGISTRATION_CLOSING',
  SUBMISSION_DEADLINE = 'SUBMISSION_DEADLINE',
  JUDGING_STARTED = 'JUDGING_STARTED',
  JUDGING_COMPLETED = 'JUDGING_COMPLETED',
  RESULTS_PUBLISHED = 'RESULTS_PUBLISHED',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  TEAM_UPDATE = 'TEAM_UPDATE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export enum NotificationDeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

export enum AnnouncementRecipientScope {
  ALL_PARTICIPANTS = 'ALL_PARTICIPANTS',
  ALL_TEAMS = 'ALL_TEAMS',
  ALL_ORGANIZERS = 'ALL_ORGANIZERS',
  ALL_JUDGES = 'ALL_JUDGES',
  TRACK = 'TRACK',
}

export interface NotificationEntity {
  id: string;
  userId: string;
  organizationId?: string | null;
  hackathonId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown> | null;
  deliveryStatus: NotificationDeliveryStatus;
  idempotencyKey?: string | null;
  readAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AnnouncementEntity {
  id: string;
  hackathonId: string;
  organizationId: string;
  authorId: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  recipientScope: AnnouncementRecipientScope;
  targetTrackId?: string | null;
  scheduledAt?: Date | string | null;
  publishedAt?: Date | string | null;
  cancelledAt?: Date | string | null;
  version: number;
  metadata?: Record<string, unknown> | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: {
    id: string;
    email: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export interface NotificationPreferenceEntity {
  id: string;
  userId: string;
  inAppAnnouncements: boolean;
  inAppReminders: boolean;
  inAppTeamUpdates: boolean;
  inAppResults: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateAnnouncementDto {
  title: string;
  body: string;
  recipientScope?: AnnouncementRecipientScope;
  targetTrackId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateAnnouncementDto {
  title?: string;
  body?: string;
  recipientScope?: AnnouncementRecipientScope;
  targetTrackId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ScheduleAnnouncementDto {
  scheduledAt: string | Date;
}

export interface NotificationListQueryDto {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
  hackathonId?: string;
}

export interface AnnouncementListQueryDto {
  status?: AnnouncementStatus;
  targetTrackId?: string;
}

export interface UpdateNotificationPreferenceDto {
  inAppAnnouncements?: boolean;
  inAppReminders?: boolean;
  inAppTeamUpdates?: boolean;
  inAppResults?: boolean;
}

export interface UnreadCountResponseDto {
  unreadCount: number;
}

export interface PaginatedNotificationsResponseDto {
  items: NotificationEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}
