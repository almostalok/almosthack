import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  RoleName,
  HackathonStatus,
  RegistrationStatus,
  HackathonVisibility,
} from '@almosthack/types';
import { HackathonsService } from './hackathons.service';
import { PrismaService } from '../../database/prisma.service';
import { AuthorizationService } from '../auth/authorization.service';

describe('HackathonsService Unit Tests', () => {
  let service: HackathonsService;
  let prisma: any;
  let authService: any;

  const mockOrgId = 'org-uuid-1111';
  const mockUserId = 'user-uuid-2222';
  const mockUserRoles = [RoleName.ORGANIZER];
  const mockUserEmail = 'organizer@almosthack.org';

  const validDates = {
    registrationStartsAt: '2026-09-01T00:00:00.000Z',
    registrationEndsAt: '2026-09-10T00:00:00.000Z',
    startsAt: '2026-09-15T00:00:00.000Z',
    endsAt: '2026-09-20T00:00:00.000Z',
  };

  const sampleHackathonRecord = {
    id: 'hackathon-uuid-3333',
    organizationId: mockOrgId,
    name: 'Awesome Tech Sprint 2026',
    slug: 'awesome-tech-sprint-2026',
    description: 'An auditable hackathon event',
    logoUrl: 'https://example.com/logo.png',
    websiteUrl: 'https://example.com',
    timezone: 'Asia/Kolkata',
    status: HackathonStatus.DRAFT,
    visibility: HackathonVisibility.PRIVATE,
    registrationStartsAt: new Date(validDates.registrationStartsAt),
    registrationEndsAt: new Date(validDates.registrationEndsAt),
    startsAt: new Date(validDates.startsAt),
    endsAt: new Date(validDates.endsAt),
    publishedAt: null,
    completedAt: null,
    archivedAt: null,
    createdAt: new Date('2026-08-16T12:00:00.000Z'),
    updatedAt: new Date('2026-08-16T12:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      organization: {
        findUnique: jest.fn(),
      },
      hackathon: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-id' }),
      },
    };

    authService = {
      canAsync: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackathonsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuthorizationService, useValue: authService },
      ],
    }).compile();

    service = module.get<HackathonsService>(HackathonsService);
  });

  describe('1. Slug Normalization & Generation', () => {
    it('should generate lower-case hyphenated slug from name', () => {
      expect(service.generateSlug('Web3 Security & AI Hack! 2026')).toBe(
        'web3-security-ai-hack-2026'
      );
    });

    it('should sanitize explicit slug provided', () => {
      expect(service.generateSlug('Some Name', 'My-Custom--Slug!')).toBe(
        'my-custom-slug'
      );
    });
  });

  describe('2. Date Invariant Validations', () => {
    it('should pass for chronological ordering', () => {
      const regStarts = new Date('2026-09-01T00:00:00Z');
      const regEnds = new Date('2026-09-05T00:00:00Z');
      const starts = new Date('2026-09-05T00:00:00Z');
      const ends = new Date('2026-09-10T00:00:00Z');

      expect(() =>
        service.validateDateInvariants(regStarts, regEnds, starts, ends)
      ).not.toThrow();
    });

    it('should throw BadRequestException if registrationStartsAt >= registrationEndsAt', () => {
      const regStarts = new Date('2026-09-05T00:00:00Z');
      const regEnds = new Date('2026-09-05T00:00:00Z');
      const starts = new Date('2026-09-10T00:00:00Z');
      const ends = new Date('2026-09-15T00:00:00Z');

      expect(() =>
        service.validateDateInvariants(regStarts, regEnds, starts, ends)
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if registrationEndsAt > startsAt', () => {
      const regStarts = new Date('2026-09-01T00:00:00Z');
      const regEnds = new Date('2026-09-11T00:00:00Z');
      const starts = new Date('2026-09-10T00:00:00Z');
      const ends = new Date('2026-09-15T00:00:00Z');

      expect(() =>
        service.validateDateInvariants(regStarts, regEnds, starts, ends)
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if startsAt >= endsAt', () => {
      const regStarts = new Date('2026-09-01T00:00:00Z');
      const regEnds = new Date('2026-09-05T00:00:00Z');
      const starts = new Date('2026-09-15T00:00:00Z');
      const ends = new Date('2026-09-10T00:00:00Z');

      expect(() =>
        service.validateDateInvariants(regStarts, regEnds, starts, ends)
      ).toThrow(BadRequestException);
    });
  });

  describe('3. Registration & Effective State Derivation', () => {
    const regStart = new Date('2026-09-01T00:00:00Z');
    const regEnd = new Date('2026-09-10T00:00:00Z');
    const eventStart = new Date('2026-09-10T00:00:00Z');
    const eventEnd = new Date('2026-09-15T00:00:00Z');

    it('should derive RegistrationStatus.NOT_OPEN before registrationStartsAt (T < start)', () => {
      const now = new Date('2026-08-25T00:00:00Z');
      expect(service.deriveRegistrationStatus(regStart, regEnd, now)).toBe(
        RegistrationStatus.NOT_OPEN
      );
    });

    it('should derive RegistrationStatus.OPEN at exact registrationStartsAt (T = start)', () => {
      const now = new Date('2026-09-01T00:00:00Z');
      expect(service.deriveRegistrationStatus(regStart, regEnd, now)).toBe(
        RegistrationStatus.OPEN
      );
    });

    it('should derive RegistrationStatus.OPEN inside registration window (start < T < end)', () => {
      const now = new Date('2026-09-05T00:00:00Z');
      expect(service.deriveRegistrationStatus(regStart, regEnd, now)).toBe(
        RegistrationStatus.OPEN
      );
    });

    it('should derive RegistrationStatus.CLOSED at exact registrationEndsAt (T = end)', () => {
      const now = new Date('2026-09-10T00:00:00Z');
      expect(service.deriveRegistrationStatus(regStart, regEnd, now)).toBe(
        RegistrationStatus.CLOSED
      );
    });

    it('should derive RegistrationStatus.CLOSED after registrationEndsAt (T > end)', () => {
      const now = new Date('2026-09-11T00:00:00Z');
      expect(service.deriveRegistrationStatus(regStart, regEnd, now)).toBe(
        RegistrationStatus.CLOSED
      );
    });

    it('should keep DRAFT status regardless of time', () => {
      const now = new Date('2026-09-12T00:00:00Z');
      expect(
        service.deriveEffectiveStatus(
          HackathonStatus.DRAFT,
          eventStart,
          eventEnd,
          now
        )
      ).toBe(HackathonStatus.DRAFT);
    });

    it('should derive PUBLISHED when published and before eventStart', () => {
      const now = new Date('2026-09-05T00:00:00Z');
      expect(
        service.deriveEffectiveStatus(
          HackathonStatus.PUBLISHED,
          eventStart,
          eventEnd,
          now
        )
      ).toBe(HackathonStatus.PUBLISHED);
    });

    it('should derive LIVE when event is between startsAt and endsAt', () => {
      const now = new Date('2026-09-12T00:00:00Z');
      expect(
        service.deriveEffectiveStatus(
          HackathonStatus.PUBLISHED,
          eventStart,
          eventEnd,
          now
        )
      ).toBe(HackathonStatus.LIVE);
    });

    it('should derive COMPLETED when past endsAt', () => {
      const now = new Date('2026-09-16T00:00:00Z');
      expect(
        service.deriveEffectiveStatus(
          HackathonStatus.PUBLISHED,
          eventStart,
          eventEnd,
          now
        )
      ).toBe(HackathonStatus.COMPLETED);
    });

    it('should keep ARCHIVED status', () => {
      const now = new Date('2026-09-20T00:00:00Z');
      expect(
        service.deriveEffectiveStatus(
          HackathonStatus.ARCHIVED,
          eventStart,
          eventEnd,
          now
        )
      ).toBe(HackathonStatus.ARCHIVED);
    });
  });

  describe('4. Create Hackathon', () => {
    it('should successfully create a DRAFT hackathon', async () => {
      prisma.organization.findUnique.mockResolvedValue({ id: mockOrgId });
      prisma.hackathon.findUnique.mockResolvedValue(null);
      prisma.hackathon.create.mockResolvedValue(sampleHackathonRecord);

      const result = await service.createHackathon(
        mockUserId,
        mockUserRoles,
        mockUserEmail,
        mockOrgId,
        {
          name: 'Awesome Tech Sprint 2026',
          timezone: 'Asia/Kolkata',
          ...validDates,
        }
      );

      expect(result.status).toBe(HackathonStatus.DRAFT);
      expect(result.visibility).toBe(HackathonVisibility.PRIVATE);
      expect(result.slug).toBe('awesome-tech-sprint-2026');
      expect(prisma.hackathon.create).toHaveBeenCalled();
    });

    it('should reject invalid IANA timezone', async () => {
      prisma.organization.findUnique.mockResolvedValue({ id: mockOrgId });

      await expect(
        service.createHackathon(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          mockOrgId,
          {
            name: 'Hackathon',
            timezone: 'Invalid/Timezone_Name_XYZ',
            ...validDates,
          }
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException on duplicate slug in organization', async () => {
      prisma.organization.findUnique.mockResolvedValue({ id: mockOrgId });
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);

      await expect(
        service.createHackathon(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          mockOrgId,
          {
            name: 'Awesome Tech Sprint 2026',
            ...validDates,
          }
        )
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('5. Lifecycle Transitions & Restrictions', () => {
    it('should allow publishing a DRAFT hackathon', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);
      prisma.hackathon.update.mockResolvedValue({
        ...sampleHackathonRecord,
        status: HackathonStatus.PUBLISHED,
        visibility: HackathonVisibility.PUBLIC,
        publishedAt: new Date(),
      });

      const res = await service.publishHackathon(
        mockUserId,
        mockUserRoles,
        mockUserEmail,
        sampleHackathonRecord.id
      );

      expect(res.status).toBe(HackathonStatus.PUBLISHED);
      expect(res.visibility).toBe(HackathonVisibility.PUBLIC);
    });

    it('should reject publishing if hackathon is not DRAFT', async () => {
      prisma.hackathon.findUnique.mockResolvedValue({
        ...sampleHackathonRecord,
        status: HackathonStatus.PUBLISHED,
      });

      await expect(
        service.publishHackathon(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          sampleHackathonRecord.id
        )
      ).rejects.toThrow(ConflictException);
    });

    it('should allow archiving only when hackathon is COMPLETED', async () => {
      const pastRecord = {
        ...sampleHackathonRecord,
        status: HackathonStatus.PUBLISHED,
        startsAt: new Date('2026-07-01T00:00:00Z'),
        endsAt: new Date('2026-07-05T00:00:00Z'),
      };
      prisma.hackathon.findUnique.mockResolvedValue(pastRecord);
      prisma.hackathon.update.mockResolvedValue({
        ...pastRecord,
        status: HackathonStatus.ARCHIVED,
        archivedAt: new Date(),
      });

      const res = await service.archiveHackathon(
        mockUserId,
        mockUserRoles,
        mockUserEmail,
        pastRecord.id
      );

      expect(res.status).toBe(HackathonStatus.ARCHIVED);
    });

    it('should reject archiving if hackathon is currently LIVE or DRAFT', async () => {
      const liveRecord = {
        ...sampleHackathonRecord,
        status: HackathonStatus.PUBLISHED,
        startsAt: new Date('2026-08-01T00:00:00Z'),
        endsAt: new Date('2026-08-30T00:00:00Z'),
      };
      prisma.hackathon.findUnique.mockResolvedValue(liveRecord);

      await expect(
        service.archiveHackathon(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          liveRecord.id
        )
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('6. Organization Authorization Assertion', () => {
    it('should throw ForbiddenException if user lacks organization permission', async () => {
      authService.canAsync.mockResolvedValue(false);
      prisma.organization.findUnique.mockResolvedValue({ id: mockOrgId });

      await expect(
        service.createHackathon(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          mockOrgId,
          {
            name: 'Unauthorized Hackathon',
            ...validDates,
          }
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
