import {
  AnnouncementEntity,
  AnnouncementStatus,
  AnnouncementRecipientScope,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  ScheduleAnnouncementDto,
} from '@almosthack/types';

export {
  AnnouncementStatus,
  AnnouncementRecipientScope,
};

export type {
  AnnouncementEntity,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  ScheduleAnnouncementDto,
};

export interface AnnouncementMetrics {
  total: number;
  published: number;
  scheduled: number;
  drafts: number;
  recipientsReached: number;
}

export interface AnnouncementFilterState {
  status: 'ALL' | AnnouncementStatus;
  scope: 'ALL' | AnnouncementRecipientScope;
  trackId: string;
  search: string;
}

export interface AnnouncementTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  body: string;
  scope: AnnouncementRecipientScope;
}
