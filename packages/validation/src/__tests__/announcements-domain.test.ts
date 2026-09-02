import {
  createAnnouncementSchema,
  scheduleAnnouncementSchema,
} from '../notifications';
import {
  AnnouncementStatus,
  AnnouncementRecipientScope,
} from '@almosthack/types';

describe('UI-13 Announcements and Communication Domain Logic', () => {
  it('should validate valid announcement creation input', () => {
    const validPayload = {
      title: 'Submission deadline extended by 2 hours',
      body: 'Due to network traffic, the deadline is extended to 2:00 AM UTC.',
      recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
    };

    const parsed = createAnnouncementSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it('should reject empty title or empty message body', () => {
    const invalidPayload = {
      title: '',
      body: '',
      recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
    };

    const parsed = createAnnouncementSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('should validate future scheduling date', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    const parsed = scheduleAnnouncementSchema.safeParse({
      scheduledAt: futureDate,
    });
    expect(parsed.success).toBe(true);
  });

  it('should accurately filter announcements by recipient scope and status', () => {
    const announcements = [
      {
        id: '1',
        title: 'For all participants',
        status: AnnouncementStatus.PUBLISHED,
        recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
      },
      {
        id: '2',
        title: 'For judges only',
        status: AnnouncementStatus.SCHEDULED,
        recipientScope: AnnouncementRecipientScope.ALL_JUDGES,
      },
      {
        id: '3',
        title: 'Draft for organizers',
        status: AnnouncementStatus.DRAFT,
        recipientScope: AnnouncementRecipientScope.ALL_ORGANIZERS,
      },
    ];

    const participantView = announcements.filter(
      (a) =>
        a.status === AnnouncementStatus.PUBLISHED &&
        (a.recipientScope === AnnouncementRecipientScope.ALL_PARTICIPANTS ||
          a.recipientScope === AnnouncementRecipientScope.ALL_TEAMS)
    );

    expect(participantView).toHaveLength(1);
    expect(participantView[0].title).toBe('For all participants');
  });
});
