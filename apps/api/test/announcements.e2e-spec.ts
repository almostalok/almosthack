import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { requestIdMiddleware } from '../src/common/middleware/request-id.middleware';
import { PrismaService } from '../src/database/prisma.service';
import { RedisHealthIndicator } from '../src/infrastructure/redis/redis.health';
import { QueueService } from '../src/infrastructure/queue/queue.service';
import { NotificationSchedulerService } from '../src/modules/notifications/scheduler/notification-scheduler.service';
import {
  AnnouncementStatus,
  AnnouncementRecipientScope,
  NotificationType,
  HackathonStatus,
} from '@prisma/client';

describe('Announcements, Scheduling & Milestone Operations E2E (S6)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let scheduler: NotificationSchedulerService;

  const timestamp = Date.now();
  let orgOwnerCookie: string;
  let otherOrgOwnerCookie: string;
  let participantCookie: string;

  let orgOwnerUserId: string;
  let otherOrgOwnerUserId: string;
  let participantUserId: string;

  let orgAId: string;
  let orgBId: string;
  let hackathonAId: string;
  let hackathonBId: string;
  let track1Id: string;

  let announcementId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisHealthIndicator)
      .useValue({ isHealthy: jest.fn().mockResolvedValue(true) })
      .overrideProvider(QueueService)
      .useValue({
        addJob: jest.fn().mockResolvedValue('mock-job-id'),
        isHealthy: jest.fn().mockResolvedValue(true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.use(requestIdMiddleware);

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'api/v',
    });

    const reflector = app.get(Reflector);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(reflector)
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
    scheduler = app.get<NotificationSchedulerService>(NotificationSchedulerService);

    // 1. Create Org Owner A
    const u1 = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `org_ann_owner_${timestamp}@almosthack.com`,
        password: 'Password123!',
        name: 'Org Owner A',
      })
      .expect(201);
    orgOwnerCookie = u1.get('Set-Cookie')?.[0] || '';
    orgOwnerUserId = u1.body.data.id;

    // 2. Create Org Owner B
    const u2 = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `other_org_ann_owner_${timestamp}@almosthack.com`,
        password: 'Password123!',
        name: 'Org Owner B',
      })
      .expect(201);
    otherOrgOwnerCookie = u2.get('Set-Cookie')?.[0] || '';
    otherOrgOwnerUserId = u2.body.data.id;

    // 3. Create Participant
    const u3 = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `part_ann_${timestamp}@almosthack.com`,
        password: 'Password123!',
        name: 'Participant User',
      })
      .expect(201);
    participantCookie = u3.get('Set-Cookie')?.[0] || '';
    participantUserId = u3.body.data.id;

    // 4. Create Organization A
    const orgA = await prisma.organization.create({
      data: {
        name: `Org A Ops ${timestamp}`,
        slug: `org-a-ops-${timestamp}`,
        members: { create: { userId: orgOwnerUserId, role: 'OWNER', status: 'ACTIVE' } },
      },
    });
    orgAId = orgA.id;

    // 5. Create Organization B
    const orgB = await prisma.organization.create({
      data: {
        name: `Org B Ops ${timestamp}`,
        slug: `org-b-ops-${timestamp}`,
        members: { create: { userId: otherOrgOwnerUserId, role: 'OWNER', status: 'ACTIVE' } },
      },
    });
    orgBId = orgB.id;

    // 6. Create Hackathons
    const now = new Date();
    const hackA = await prisma.hackathon.create({
      data: {
        organizationId: orgAId,
        name: `Hackathon Ops A ${timestamp}`,
        slug: `hack-ops-a-${timestamp}`,
        registrationStartsAt: new Date(now.getTime() - 86400000 * 2),
        registrationEndsAt: new Date(now.getTime() + 86400000 * 2),
        startsAt: new Date(now.getTime() + 86400000),
        endsAt: new Date(now.getTime() + 172800000),
        status: 'PUBLISHED',
      },
    });
    hackathonAId = hackA.id;

    const hackB = await prisma.hackathon.create({
      data: {
        organizationId: orgBId,
        name: `Hackathon Ops B ${timestamp}`,
        slug: `hack-ops-b-${timestamp}`,
        registrationStartsAt: new Date(now.getTime() - 86400000 * 2),
        registrationEndsAt: new Date(now.getTime() + 86400000 * 2),
        startsAt: new Date(now.getTime() + 86400000),
        endsAt: new Date(now.getTime() + 172800000),
        status: 'PUBLISHED',
      },
    });
    hackathonBId = hackB.id;

    // 8. Create Track for Hackathon A
    const track = await prisma.hackathonTrack.create({
      data: {
        hackathonId: hackathonAId,
        name: 'AI Track',
        slug: 'ai-track',
        displayOrder: 1,
      },
    });
    track1Id = track.id;

    // 9. Register Participant for Hackathon A
    await prisma.participantRegistration.create({
      data: {
        hackathonId: hackathonAId,
        userId: participantUserId,
        trackId: track1Id,
        status: 'REGISTERED',
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.notification.deleteMany({
        where: {
          userId: { in: [orgOwnerUserId, otherOrgOwnerUserId, participantUserId] },
        },
      });
      await prisma.announcement.deleteMany({
        where: { hackathonId: { in: [hackathonAId, hackathonBId] } },
      });
      await prisma.participantRegistration.deleteMany({
        where: { hackathonId: { in: [hackathonAId, hackathonBId] } },
      });
      await prisma.hackathonTrack.deleteMany({
        where: { hackathonId: { in: [hackathonAId, hackathonBId] } },
      });
      await prisma.hackathon.deleteMany({
        where: { id: { in: [hackathonAId, hackathonBId] } },
      });
      await prisma.organizationMember.deleteMany({
        where: { organizationId: { in: [orgAId, orgBId] } },
      });
      await prisma.organization.deleteMany({
        where: { id: { in: [orgAId, orgBId] } },
      });
      await prisma.session.deleteMany({
        where: {
          userId: { in: [orgOwnerUserId, otherOrgOwnerUserId, participantUserId] },
        },
      });
      await prisma.user.deleteMany({
        where: {
          id: { in: [orgOwnerUserId, otherOrgOwnerUserId, participantUserId] },
        },
      });
    }
    await app.close();
  });

  describe('1. RBAC & Multi-Tenant Authorization', () => {
    it('should reject participant creating an announcement', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/announcements`)
        .set('Cookie', participantCookie)
        .send({
          title: 'Participant Announcement',
          body: 'Testing unauthorized creation',
        })
        .expect(403);
    });

    it('should reject Org B owner creating announcement in Hackathon A', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/announcements`)
        .set('Cookie', otherOrgOwnerCookie)
        .send({
          title: 'Cross Tenant Hack',
          body: 'Testing cross-tenant isolation',
        })
        .expect(403);
    });

    it('should allow Hackathon A organizer to create a draft announcement', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/announcements`)
        .set('Cookie', orgOwnerCookie)
        .send({
          title: 'Welcome to Hackathon Ops A!',
          body: 'We are thrilled to launch the operational platform.',
          recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
        })
        .expect(201);

      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe('Welcome to Hackathon Ops A!');
      expect(res.body.data.status).toBe(AnnouncementStatus.DRAFT);
      expect(res.body.data.version).toBe(1);

      announcementId = res.body.data.id;
    });
  });

  describe('2. Announcement Editing & Scheduling Lifecycle', () => {
    it('should allow organizer to update a draft announcement', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonAId}/announcements/${announcementId}`)
        .set('Cookie', orgOwnerCookie)
        .send({
          title: 'Welcome to Hackathon Ops A (Updated)!',
          body: 'Updated instructions for all registered hackers.',
        })
        .expect(200);

      expect(res.body.data.title).toBe('Welcome to Hackathon Ops A (Updated)!');
      expect(res.body.data.version).toBe(2);
    });

    it('should reject scheduling announcement in the past', async () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString();
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/announcements/${announcementId}/schedule`)
        .set('Cookie', orgOwnerCookie)
        .send({
          scheduledAt: pastDate,
        })
        .expect(400);
    });

    it('should schedule announcement for future publication', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/announcements/${announcementId}/schedule`)
        .set('Cookie', orgOwnerCookie)
        .send({
          scheduledAt: futureDate,
        })
        .expect(200);

      expect(res.body.data.status).toBe(AnnouncementStatus.SCHEDULED);
      expect(res.body.data.scheduledAt).toBeDefined();
    });

    it('should cancel a scheduled announcement', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/announcements/${announcementId}/cancel`)
        .set('Cookie', orgOwnerCookie)
        .expect(200);

      expect(res.body.data.status).toBe(AnnouncementStatus.CANCELLED);
      expect(res.body.data.cancelledAt).toBeDefined();
    });

    it('should reject editing or publishing a cancelled announcement', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonAId}/announcements/${announcementId}`)
        .set('Cookie', orgOwnerCookie)
        .send({ title: 'Try editing cancelled' })
        .expect(409);

      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/announcements/${announcementId}/publish`)
        .set('Cookie', orgOwnerCookie)
        .expect(409);
    });
  });

  describe('3. Publishing & Notification Fanout', () => {
    let publishableAnnouncementId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/announcements`)
        .set('Cookie', orgOwnerCookie)
        .send({
          title: 'Official Hackathon Kickoff!',
          body: 'The hacking phase has officially started. Build something great!',
          recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
        })
        .expect(201);
      publishableAnnouncementId = res.body.data.id;
    });

    it('should publish announcement immediately and deliver notification to registered participant', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/announcements/${publishableAnnouncementId}/publish`)
        .set('Cookie', orgOwnerCookie)
        .expect(200);

      expect(res.body.data.status).toBe(AnnouncementStatus.PUBLISHED);
      expect(res.body.data.publishedAt).toBeDefined();

      // Check Participant notifications
      const notifRes = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Cookie', participantCookie)
        .expect(200);

      expect(notifRes.body.data.items).toHaveLength(1);
      expect(notifRes.body.data.items[0].title).toBe('Official Hackathon Kickoff!');
      expect(notifRes.body.data.items[0].type).toBe(NotificationType.ANNOUNCEMENT);
      expect(notifRes.body.data.items[0].idempotencyKey).toBe(
        `announcement_${publishableAnnouncementId}_${participantUserId}`
      );
    });

    it('should be idempotent and not create duplicate notifications on duplicate publish calls', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/announcements/${publishableAnnouncementId}/publish`)
        .set('Cookie', orgOwnerCookie)
        .expect(200);

      const notifRes = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Cookie', participantCookie)
        .expect(200);

      expect(notifRes.body.data.items).toHaveLength(1);
    });

    it('should allow participant to view published announcements in feed', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/announcements`)
        .set('Cookie', participantCookie)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(publishableAnnouncementId);
      expect(res.body.data[0].status).toBe(AnnouncementStatus.PUBLISHED);
    });
  });

  describe('4. Notification Scheduler Operations', () => {
    it('should auto-publish due scheduled announcements', async () => {
      // Create an announcement scheduled for 10 seconds ago
      const dueAnnouncement = await prisma.announcement.create({
        data: {
          hackathonId: hackathonAId,
          organizationId: orgAId,
          authorId: orgOwnerUserId,
          title: 'Scheduled Event Milestone Triggered',
          body: 'Auto published milestone announcement.',
          status: AnnouncementStatus.SCHEDULED,
          recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
          scheduledAt: new Date(Date.now() - 10000),
          version: 1,
        },
      });

      const res = await scheduler.processDueScheduledAnnouncements();
      expect(res.processedCount).toBeGreaterThanOrEqual(1);

      const updated = await prisma.announcement.findUnique({
        where: { id: dueAnnouncement.id },
      });
      expect(updated?.status).toBe(AnnouncementStatus.PUBLISHED);
      expect(updated?.publishedAt).not.toBeNull();
    });

    it('should generate milestone reminders without mutating hackathon lifecycle', async () => {
      // Set hackathon registration closing in 2 hours
      await prisma.hackathon.update({
        where: { id: hackathonAId },
        data: {
          status: HackathonStatus.PUBLISHED,
          registrationEndsAt: new Date(Date.now() + 2 * 3600000),
        },
      });

      const res = await scheduler.processMilestoneReminders();
      expect(res.sentCount).toBeGreaterThanOrEqual(1);

      // Verify participant received REGISTRATION_CLOSING notification
      const notif = await prisma.notification.findFirst({
        where: {
          userId: participantUserId,
          type: NotificationType.REGISTRATION_CLOSING,
        },
      });
      expect(notif).toBeDefined();
      expect(notif?.title).toContain('Registration Closing Soon');

      // Verify Hackathon status was untouched (not mutated)
      const hCheck = await prisma.hackathon.findUnique({
        where: { id: hackathonAId },
      });
      expect(hCheck?.status).toBe(HackathonStatus.PUBLISHED);
    });
  });
});
