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
      hackathonConfiguration: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      hackathonTrack: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _max: { displayOrder: 0 } }),
      },
      hackathonChallenge: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _max: { displayOrder: 0 } }),
      },
      user: {
        findUnique: jest.fn(),
      },
      participantRegistration: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      team: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      teamMember: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
      teamInvitation: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (arg) => {
        if (Array.isArray(arg)) {
          return Promise.all(arg);
        }
        return arg(prisma);
      }),
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

  describe('7. Hackathon Configuration Management', () => {
    const mockConfigRecord = {
      id: 'config-uuid-1',
      hackathonId: sampleHackathonRecord.id,
      participationMode: 'BOTH',
      minTeamSize: 1,
      maxTeamSize: 4,
      eligibilityType: 'OPEN',
      allowedBranches: ['CSE', 'ECE'],
      allowedColleges: ['MIT', 'Stanford'],
      graduationYearFrom: 2024,
      graduationYearTo: 2028,
      aiUsagePolicy: 'ALLOWED',
      aiDisclosureRequired: false,
      preExistingCodePolicy: 'PROHIBITED',
      openSourcePolicy: 'ALLOWED_WITH_ATTRIBUTION',
      githubRequired: true,
      repositoryPolicy: 'PLATFORM_MANAGED',
      rulesMarkdown: '# Default Rules',
      createdAt: new Date('2026-08-16T12:00:00Z'),
      updatedAt: new Date('2026-08-16T12:00:00Z'),
    };

    it('should retrieve hackathon configuration with defaults ensured', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);
      prisma.hackathonConfiguration.findUnique.mockResolvedValue(mockConfigRecord);

      const config = await service.getHackathonConfiguration(
        mockUserId,
        mockUserRoles,
        sampleHackathonRecord.id
      );

      expect(config.hackathonId).toBe(sampleHackathonRecord.id);
      expect(config.participationMode).toBe('BOTH');
      expect(config.minTeamSize).toBe(1);
      expect(config.maxTeamSize).toBe(4);
      expect(config.githubRequired).toBe(true);
    });

    it('should update configuration in DRAFT state', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);
      prisma.hackathonConfiguration.findUnique.mockResolvedValue(mockConfigRecord);
      prisma.hackathonConfiguration.update.mockResolvedValue({
        ...mockConfigRecord,
        participationMode: 'TEAM',
        minTeamSize: 2,
        maxTeamSize: 5,
        aiUsagePolicy: 'RESTRICTED',
        aiDisclosureRequired: true,
      });

      const updated = await service.updateHackathonConfiguration(
        mockUserId,
        mockUserRoles,
        mockUserEmail,
        sampleHackathonRecord.id,
        {
          participationMode: 'TEAM' as any,
          minTeamSize: 2,
          maxTeamSize: 5,
          aiUsagePolicy: 'RESTRICTED' as any,
          aiDisclosureRequired: true,
        }
      );

      expect(updated.participationMode).toBe('TEAM');
      expect(updated.minTeamSize).toBe(2);
      expect(updated.maxTeamSize).toBe(5);
      expect(updated.aiUsagePolicy).toBe('RESTRICTED');
      expect(updated.aiDisclosureRequired).toBe(true);
    });

    it('should normalize minTeamSize and maxTeamSize to null if INDIVIDUAL participationMode is selected', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);
      prisma.hackathonConfiguration.findUnique.mockResolvedValue(mockConfigRecord);
      prisma.hackathonConfiguration.update.mockImplementation(({ data }) =>
        Promise.resolve({ ...mockConfigRecord, ...data })
      );

      const updated = await service.updateHackathonConfiguration(
        mockUserId,
        mockUserRoles,
        mockUserEmail,
        sampleHackathonRecord.id,
        {
          participationMode: 'INDIVIDUAL' as any,
          minTeamSize: 2,
          maxTeamSize: 4,
        }
      );

      expect(updated.participationMode).toBe('INDIVIDUAL');
      expect(updated.minTeamSize).toBeNull();
      expect(updated.maxTeamSize).toBeNull();
    });

    it('should reject invalid team size invariant (minTeamSize > maxTeamSize)', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);
      prisma.hackathonConfiguration.findUnique.mockResolvedValue(mockConfigRecord);

      await expect(
        service.updateHackathonConfiguration(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          sampleHackathonRecord.id,
          {
            minTeamSize: 5,
            maxTeamSize: 3,
          }
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid graduation year invariant (from > to)', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);
      prisma.hackathonConfiguration.findUnique.mockResolvedValue(mockConfigRecord);

      await expect(
        service.updateHackathonConfiguration(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          sampleHackathonRecord.id,
          {
            graduationYearFrom: 2028,
            graduationYearTo: 2024,
          }
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should lock core policy modification when hackathon effective status is LIVE', async () => {
      const liveHackathon = {
        ...sampleHackathonRecord,
        status: HackathonStatus.PUBLISHED,
        startsAt: new Date('2026-08-01T00:00:00Z'),
        endsAt: new Date('2026-08-30T00:00:00Z'),
      };
      prisma.hackathon.findUnique.mockResolvedValue(liveHackathon);

      await expect(
        service.updateHackathonConfiguration(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          liveHackathon.id,
          {
            participationMode: 'INDIVIDUAL' as any,
          }
        )
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('8. Participant-Facing Rules Management', () => {
    const mockConfigRecord = {
      id: 'config-uuid-1',
      hackathonId: sampleHackathonRecord.id,
      participationMode: 'BOTH',
      minTeamSize: 1,
      maxTeamSize: 4,
      eligibilityType: 'OPEN',
      allowedBranches: [],
      allowedColleges: [],
      graduationYearFrom: null,
      graduationYearTo: null,
      aiUsagePolicy: 'ALLOWED',
      aiDisclosureRequired: false,
      preExistingCodePolicy: 'PROHIBITED',
      openSourcePolicy: 'ALLOWED_WITH_ATTRIBUTION',
      githubRequired: true,
      repositoryPolicy: 'PLATFORM_MANAGED',
      rulesMarkdown: '### Official Hackathon Rules\n1. Be respectful\n2. Original work only.',
      createdAt: new Date('2026-08-16T12:00:00Z'),
      updatedAt: new Date('2026-08-16T12:00:00Z'),
    };

    it('should return public rules for a published hackathon', async () => {
      const publishedHackathon = {
        ...sampleHackathonRecord,
        status: HackathonStatus.PUBLISHED,
        visibility: HackathonVisibility.PUBLIC,
      };
      prisma.hackathon.findUnique.mockResolvedValue(publishedHackathon);
      prisma.hackathonConfiguration.findUnique.mockResolvedValue(mockConfigRecord);

      const rules = await service.getHackathonRules(
        undefined,
        undefined,
        publishedHackathon.id
      );

      expect(rules.hackathonId).toBe(publishedHackathon.id);
      expect(rules.rulesMarkdown).toContain('Official Hackathon Rules');
      expect(rules.participationMode).toBe('BOTH');
    });

    it('should update rules markdown in DRAFT state', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);
      prisma.hackathonConfiguration.findUnique.mockResolvedValue(mockConfigRecord);
      prisma.hackathonConfiguration.update.mockResolvedValue({
        ...mockConfigRecord,
        rulesMarkdown: '# Updated Rules Markdown',
      });

      const updated = await service.updateHackathonRules(
        mockUserId,
        mockUserRoles,
        mockUserEmail,
        sampleHackathonRecord.id,
        { rulesMarkdown: '# Updated Rules Markdown' }
      );

      expect(prisma.hackathonConfiguration.update).toHaveBeenCalledWith({
        where: { hackathonId: sampleHackathonRecord.id },
        data: { rulesMarkdown: '# Updated Rules Markdown' },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(updated).toBeDefined();
    });

    it('should reject rules update when effective status is COMPLETED or LIVE', async () => {
      const completedHackathon = {
        ...sampleHackathonRecord,
        status: HackathonStatus.PUBLISHED,
        startsAt: new Date('2026-07-01T00:00:00Z'),
        endsAt: new Date('2026-07-05T00:00:00Z'),
      };
      prisma.hackathon.findUnique.mockResolvedValue(completedHackathon);

      await expect(
        service.updateHackathonRules(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          completedHackathon.id,
          { rulesMarkdown: 'New rules' }
        )
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('9. Track Management (S2-03)', () => {
    const sampleTrack = {
      id: 'track-uuid-1',
      hackathonId: sampleHackathonRecord.id,
      name: 'AI Agents',
      slug: 'ai-agents',
      shortDescription: 'Build AI agents',
      description: 'Full description of AI track',
      displayOrder: 1,
      isActive: true,
      createdAt: new Date('2026-08-16T12:00:00Z'),
      updatedAt: new Date('2026-08-16T12:00:00Z'),
      _count: { challenges: 0 },
    };

    it('should create track with normalized slug and auto displayOrder', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);
      prisma.hackathonTrack.findUnique.mockResolvedValue(null);
      prisma.hackathonTrack.aggregate.mockResolvedValue({ _max: { displayOrder: 2 } });
      prisma.hackathonTrack.create.mockResolvedValue({
        ...sampleTrack,
        displayOrder: 3,
      });

      const res = await service.createHackathonTrack(
        mockUserId,
        mockUserRoles,
        mockUserEmail,
        sampleHackathonRecord.id,
        { name: 'AI Agents' }
      );

      expect(res.name).toBe('AI Agents');
      expect(res.slug).toBe('ai-agents');
      expect(prisma.hackathonTrack.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('should reject track creation on slug conflict', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);
      prisma.hackathonTrack.findUnique.mockResolvedValue(sampleTrack);

      await expect(
        service.createHackathonTrack(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          sampleHackathonRecord.id,
          { name: 'AI Agents' }
        )
      ).rejects.toThrow(ConflictException);
    });

    it('should reject track creation when hackathon is LIVE or COMPLETED', async () => {
      const liveHackathon = {
        ...sampleHackathonRecord,
        status: HackathonStatus.PUBLISHED,
        startsAt: new Date('2026-08-01T00:00:00Z'),
        endsAt: new Date('2026-08-30T00:00:00Z'),
      };
      prisma.hackathon.findUnique.mockResolvedValue(liveHackathon);

      await expect(
        service.createHackathonTrack(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          liveHackathon.id,
          { name: 'New Track' }
        )
      ).rejects.toThrow(ConflictException);
    });

    it('should reorder tracks atomically', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(sampleHackathonRecord);
      prisma.hackathonTrack.findMany
        .mockResolvedValueOnce([{ id: 'track-uuid-1' }, { id: 'track-uuid-2' }])
        .mockResolvedValueOnce([
          { ...sampleTrack, id: 'track-uuid-2', displayOrder: 1 },
          { ...sampleTrack, id: 'track-uuid-1', displayOrder: 2 },
        ]);

      const res = await service.reorderHackathonTracks(
        mockUserId,
        mockUserRoles,
        mockUserEmail,
        sampleHackathonRecord.id,
        {
          items: [
            { id: 'track-uuid-2', displayOrder: 1 },
            { id: 'track-uuid-1', displayOrder: 2 },
          ],
        }
      );

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(res.length).toBe(2);
    });
  });

  describe('10. Challenge Management (S2-03)', () => {
    const sampleTrackWithHackathon = {
      id: 'track-uuid-1',
      hackathonId: sampleHackathonRecord.id,
      name: 'AI Agents',
      slug: 'ai-agents',
      hackathon: sampleHackathonRecord,
    };

    const sampleChallenge = {
      id: 'challenge-uuid-1',
      trackId: 'track-uuid-1',
      name: 'Autonomous PR Reviewer',
      slug: 'autonomous-pr-reviewer',
      description: 'Review PRs autonomously',
      problemStatement: 'Design an AI system to review Git pull requests.',
      requirements: 'Detailed feedback output',
      constraints: '<5s latency',
      expectedOutcome: 'A CLI tool',
      resources: [{ title: 'Doc', url: 'https://example.com' }],
      displayOrder: 1,
      status: 'DRAFT',
      createdAt: new Date('2026-08-16T12:00:00Z'),
      updatedAt: new Date('2026-08-16T12:00:00Z'),
    };

    it('should create challenge with problem statement and audit log', async () => {
      prisma.hackathonTrack.findUnique.mockResolvedValue(sampleTrackWithHackathon);
      prisma.hackathonChallenge.findUnique.mockResolvedValue(null);
      prisma.hackathonChallenge.create.mockResolvedValue(sampleChallenge);

      const res = await service.createTrackChallenge(
        mockUserId,
        mockUserRoles,
        mockUserEmail,
        sampleTrackWithHackathon.id,
        {
          name: 'Autonomous PR Reviewer',
          problemStatement: 'Design an AI system to review Git pull requests.',
        }
      );

      expect(res.name).toBe('Autonomous PR Reviewer');
      expect(prisma.hackathonChallenge.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('should reject challenge creation on slug conflict inside track', async () => {
      prisma.hackathonTrack.findUnique.mockResolvedValue(sampleTrackWithHackathon);
      prisma.hackathonChallenge.findUnique.mockResolvedValue(sampleChallenge);

      await expect(
        service.createTrackChallenge(
          mockUserId,
          mockUserRoles,
          mockUserEmail,
          sampleTrackWithHackathon.id,
          {
            name: 'Autonomous PR Reviewer',
            problemStatement: 'Design an AI system to review Git pull requests.',
          }
        )
      ).rejects.toThrow(ConflictException);
    });

    it('should delete challenge and log audit', async () => {
      prisma.hackathonTrack.findUnique.mockResolvedValue(sampleTrackWithHackathon);
      prisma.hackathonChallenge.findFirst.mockResolvedValue(sampleChallenge);
      prisma.hackathonChallenge.delete.mockResolvedValue(sampleChallenge);

      const res = await service.deleteTrackChallenge(
        mockUserId,
        mockUserRoles,
        mockUserEmail,
        sampleTrackWithHackathon.id,
        sampleChallenge.id
      );

      expect(res.success).toBe(true);
      expect(prisma.hackathonChallenge.delete).toHaveBeenCalledWith({
        where: { id: sampleChallenge.id },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('11. Participant Registration (S2-04)', () => {
    const mockParticipantUser = {
      id: 'participant-user-1',
      email: 'student@example.com',
      name: 'Student Participant',
      college: 'MIT',
      branch: 'Computer Science',
      graduationYear: 2026,
      skills: ['TypeScript', 'Python'],
    };

    const openHackathon = {
      ...sampleHackathonRecord,
      status: HackathonStatus.PUBLISHED,
      visibility: HackathonVisibility.PUBLIC,
      registrationStartsAt: new Date(Date.now() - 3600000), // 1h ago
      registrationEndsAt: new Date(Date.now() + 3600000),   // 1h in future
      startsAt: new Date(Date.now() + 7200000),             // 2h in future
      endsAt: new Date(Date.now() + 86400000),
      configuration: {
        id: 'cfg-1',
        hackathonId: sampleHackathonRecord.id,
        eligibilityType: 'OPEN',
        allowedBranches: [],
        allowedColleges: [],
        graduationYearFrom: null,
        graduationYearTo: null,
      },
    };

    const sampleTrack = {
      id: 'track-uuid-1',
      hackathonId: sampleHackathonRecord.id,
      name: 'AI Agents',
      slug: 'ai-agents',
      shortDescription: 'Build AI agents',
      description: 'Full description of AI track',
      displayOrder: 1,
      isActive: true,
      createdAt: new Date('2026-08-16T12:00:00Z'),
      updatedAt: new Date('2026-08-16T12:00:00Z'),
    };

    const sampleChallenge = {
      id: 'challenge-uuid-1',
      trackId: sampleTrack.id,
      name: 'Autonomous PR Reviewer',
      slug: 'autonomous-pr-reviewer',
      description: 'Review PRs',
      problemStatement: 'Design an AI system to review Git pull requests.',
      requirements: 'Outputs markdown diff comments.',
      constraints: 'Fast response.',
      expectedOutcome: 'Working prototype.',
      resources: [],
      displayOrder: 1,
      status: 'PUBLISHED',
      createdAt: new Date('2026-08-16T12:00:00Z'),
      updatedAt: new Date('2026-08-16T12:00:00Z'),
    };

    const sampleRegistration = {
      id: 'reg-uuid-1',
      hackathonId: sampleHackathonRecord.id,
      userId: mockParticipantUser.id,
      trackId: sampleTrack.id,
      challengeId: sampleChallenge.id,
      status: 'REGISTERED',
      registeredAt: new Date(),
      withdrawnAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      track: sampleTrack,
      challenge: sampleChallenge,
    };

    it('should correctly evaluate user eligibility criteria', () => {
      // Open eligibility
      expect(service.checkUserEligibility(mockParticipantUser, { eligibilityType: 'OPEN' }).isEligible).toBe(true);

      // Student only - valid college
      expect(service.checkUserEligibility(mockParticipantUser, { eligibilityType: 'STUDENTS_ONLY' }).isEligible).toBe(true);
      // Student only - missing college
      expect(service.checkUserEligibility({ ...mockParticipantUser, college: '' }, { eligibilityType: 'STUDENTS_ONLY' }).isEligible).toBe(false);

      // Allowed colleges (normalized)
      expect(service.checkUserEligibility(mockParticipantUser, { allowedColleges: ['mit', 'stanford'] }).isEligible).toBe(true);
      expect(service.checkUserEligibility(mockParticipantUser, { allowedColleges: ['harvard', 'oxford'] }).isEligible).toBe(false);

      // Allowed branches (normalized)
      expect(service.checkUserEligibility(mockParticipantUser, { allowedBranches: ['Computer Science', 'Electrical'] }).isEligible).toBe(true);
      expect(service.checkUserEligibility(mockParticipantUser, { allowedBranches: ['Mechanical'] }).isEligible).toBe(false);

      // Graduation year range
      expect(service.checkUserEligibility(mockParticipantUser, { graduationYearFrom: 2025, graduationYearTo: 2027 }).isEligible).toBe(true);
      expect(service.checkUserEligibility(mockParticipantUser, { graduationYearFrom: 2027 }).isEligible).toBe(false);
      expect(service.checkUserEligibility(mockParticipantUser, { graduationYearTo: 2024 }).isEligible).toBe(false);
    });

    it('should register participant successfully during open registration window', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(openHackathon);
      prisma.user.findUnique.mockResolvedValue(mockParticipantUser);
      prisma.hackathonTrack.findUnique.mockResolvedValue(sampleTrack);
      prisma.hackathonChallenge.findUnique.mockResolvedValue(sampleChallenge);
      prisma.participantRegistration.findUnique.mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockResolvedValue([sampleRegistration, {}]);

      const res = await service.createParticipantRegistration(
        mockParticipantUser.id,
        mockParticipantUser.email,
        openHackathon.id,
        {
          trackId: sampleTrack.id,
          challengeId: sampleChallenge.id,
        }
      );

      expect(res.id).toBe(sampleRegistration.id);
      expect(res.status).toBe('REGISTERED');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should reject registration when registration window is closed', async () => {
      const closedHackathon = {
        ...openHackathon,
        registrationStartsAt: new Date(Date.now() - 7200000),
        registrationEndsAt: new Date(Date.now() - 3600000), // ended 1h ago
      };
      prisma.hackathon.findUnique.mockResolvedValue(closedHackathon);

      await expect(
        service.createParticipantRegistration(
          mockParticipantUser.id,
          mockParticipantUser.email,
          closedHackathon.id,
          {}
        )
      ).rejects.toThrow(ConflictException);
    });

    it('should reject registration when user is ineligible', async () => {
      const restrictedHackathon = {
        ...openHackathon,
        configuration: {
          id: 'cfg-restricted',
          hackathonId: sampleHackathonRecord.id,
          eligibilityType: 'OPEN',
          allowedColleges: ['Stanford University'], // User is from MIT
          allowedBranches: [],
          graduationYearFrom: null,
          graduationYearTo: null,
        },
      };
      prisma.hackathon.findUnique.mockResolvedValue(restrictedHackathon);
      prisma.user.findUnique.mockResolvedValue(mockParticipantUser);

      await expect(
        service.createParticipantRegistration(
          mockParticipantUser.id,
          mockParticipantUser.email,
          restrictedHackathon.id,
          {}
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject registration on duplicate active registration', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(openHackathon);
      prisma.user.findUnique.mockResolvedValue(mockParticipantUser);
      prisma.participantRegistration.findUnique.mockResolvedValue(sampleRegistration);

      await expect(
        service.createParticipantRegistration(
          mockParticipantUser.id,
          mockParticipantUser.email,
          openHackathon.id,
          {}
        )
      ).rejects.toThrow(ConflictException);
    });

    it('should reactivate registration when user was previously withdrawn', async () => {
      const withdrawnRegistration = {
        ...sampleRegistration,
        status: 'WITHDRAWN',
        withdrawnAt: new Date(),
      };
      prisma.hackathon.findUnique.mockResolvedValue(openHackathon);
      prisma.user.findUnique.mockResolvedValue(mockParticipantUser);
      prisma.participantRegistration.findUnique.mockResolvedValue(withdrawnRegistration);
      (prisma.$transaction as jest.Mock).mockResolvedValue([
        { ...sampleRegistration, status: 'REGISTERED', withdrawnAt: null },
        {},
      ]);

      const res = await service.createParticipantRegistration(
        mockParticipantUser.id,
        mockParticipantUser.email,
        openHackathon.id,
        {}
      );

      expect(res.status).toBe('REGISTERED');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should update participant registration selection', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(openHackathon);
      prisma.participantRegistration.findUnique.mockResolvedValue(sampleRegistration);
      prisma.hackathonTrack.findUnique.mockResolvedValue(sampleTrack);
      prisma.hackathonChallenge.findUnique.mockResolvedValue(sampleChallenge);
      (prisma.$transaction as jest.Mock).mockResolvedValue([
        { ...sampleRegistration, trackId: sampleTrack.id },
        {},
      ]);

      const res = await service.updateParticipantRegistration(
        mockParticipantUser.id,
        mockParticipantUser.email,
        openHackathon.id,
        {
          trackId: sampleTrack.id,
        }
      );

      expect(res.id).toBe(sampleRegistration.id);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should withdraw registration and log audit', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(openHackathon);
      prisma.participantRegistration.findUnique.mockResolvedValue(sampleRegistration);
      (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}]);

      const res = await service.withdrawParticipantRegistration(
        mockParticipantUser.id,
        mockParticipantUser.email,
        openHackathon.id
      );

      expect(res.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  // ====================================================
  // 12. TEAMS & TEAM FORMATION SERVICE (S2-05)
  // ====================================================
  describe('12. Teams & Team Formation Service (S2-05)', () => {
    const mockCaptainUser = {
      id: 'captain-user-1',
      email: 'captain@almosthack.com',
      name: 'Captain Alice',
      college: 'MIT',
      branch: 'Computer Science',
      graduationYear: 2026,
      skills: ['TypeScript', 'Python'],
    };

    const openHackathon = {
      ...sampleHackathonRecord,
      status: HackathonStatus.PUBLISHED,
      visibility: HackathonVisibility.PUBLIC,
      registrationStartsAt: new Date(Date.now() - 3600000),
      registrationEndsAt: new Date(Date.now() + 3600000),
      startsAt: new Date(Date.now() + 7200000),
      endsAt: new Date(Date.now() + 86400000),
      configuration: {
        id: 'cfg-1',
        hackathonId: sampleHackathonRecord.id,
        participationMode: 'BOTH',
        maxTeamSize: 4,
        minTeamSize: 1,
        eligibilityType: 'OPEN',
        allowedBranches: [],
        allowedColleges: [],
        graduationYearFrom: null,
        graduationYearTo: null,
      },
    };

    const sampleRegistration = {
      id: 'reg-uuid-1',
      hackathonId: sampleHackathonRecord.id,
      userId: mockCaptainUser.id,
      trackId: null,
      challengeId: null,
      status: 'REGISTERED',
      registeredAt: new Date(),
      withdrawnAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sampleTeam = {
      id: 'team-uuid-1',
      hackathonId: sampleHackathonRecord.id,
      name: 'Cyber Innovators',
      slug: 'cyber-innovators',
      description: 'Building AI tools',
      createdByUserId: mockCaptainUser.id,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [
        {
          id: 'member-1',
          teamId: 'team-uuid-1',
          userId: mockCaptainUser.id,
          role: 'CAPTAIN',
          status: 'ACTIVE',
          joinedAt: new Date(),
          leftAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: mockCaptainUser,
        },
      ],
      invitations: [],
    };

    it('should create a team with captain role atomically', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(openHackathon);
      prisma.participantRegistration.findUnique.mockResolvedValue(sampleRegistration);
      prisma.teamMember.findFirst.mockResolvedValue(null);
      prisma.team.findUnique.mockResolvedValue(sampleTeam);
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        if (typeof cb === 'function') {
          return cb({
            participantRegistration: { update: jest.fn().mockResolvedValue({}) },
            teamMember: { findFirst: jest.fn().mockResolvedValue(null) },
            team: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(sampleTeam),
            },
            auditLog: { create: jest.fn().mockResolvedValue({}) },
          });
        }
        return [sampleTeam, {}];
      });

      const res = await service.createTeam(
        openHackathon.id,
        mockCaptainUser.id,
        mockCaptainUser.email,
        {
          name: 'Cyber Innovators',
          slug: 'cyber-innovators',
          description: 'Building AI tools',
        }
      );

      expect(res.id).toBe(sampleTeam.id);
      expect(res.name).toBe('Cyber Innovators');
      expect(res.memberCount).toBe(1);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should reject team creation if user is not registered for hackathon', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(openHackathon);
      prisma.participantRegistration.findUnique.mockResolvedValue(null);

      await expect(
        service.createTeam(
          openHackathon.id,
          mockCaptainUser.id,
          mockCaptainUser.email,
          { name: 'Team Alpha' }
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject team creation if user is already on an active team', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(openHackathon);
      prisma.participantRegistration.findUnique.mockResolvedValue(sampleRegistration);
      prisma.teamMember.findFirst.mockResolvedValue({ id: 'existing-mem', status: 'ACTIVE' });

      await expect(
        service.createTeam(
          openHackathon.id,
          mockCaptainUser.id,
          mockCaptainUser.email,
          { name: 'Team Alpha' }
        )
      ).rejects.toThrow(ConflictException);
    });

    it('should reject team creation if slug already exists in hackathon', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(openHackathon);
      prisma.participantRegistration.findUnique.mockResolvedValue(sampleRegistration);
      prisma.teamMember.findFirst.mockResolvedValue(null);
      prisma.team.findUnique.mockResolvedValue(sampleTeam);

      await expect(
        service.createTeam(
          openHackathon.id,
          mockCaptainUser.id,
          mockCaptainUser.email,
          { name: 'Cyber Innovators', slug: 'cyber-innovators' }
        )
      ).rejects.toThrow(ConflictException);
    });

    it('should invite eligible registered participant to team', async () => {
      const inviteeUser = { id: 'invitee-uuid', email: 'invitee@mit.edu', name: 'Invitee' };
      const teamWithCaptain = {
        ...sampleTeam,
        hackathon: openHackathon,
        members: [{ userId: mockCaptainUser.id, role: 'CAPTAIN', status: 'ACTIVE' }],
      };
      prisma.team.findUnique.mockResolvedValue(teamWithCaptain);
      prisma.user.findUnique.mockResolvedValue(inviteeUser);
      prisma.participantRegistration.findUnique.mockResolvedValue({ ...sampleRegistration, userId: inviteeUser.id });
      prisma.teamMember.findFirst.mockResolvedValue(null);
      prisma.teamInvitation.findFirst.mockResolvedValue(null);

      const createdInv = {
        id: 'inv-1',
        teamId: sampleTeam.id,
        inviteeUserId: inviteeUser.id,
        invitedByUserId: mockCaptainUser.id,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 86400000),
        respondedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        inviteeUser,
        invitedByUser: mockCaptainUser,
      };
      (prisma.$transaction as jest.Mock).mockResolvedValue([createdInv, {}]);

      const res = await service.inviteTeamMember(
        sampleTeam.id,
        mockCaptainUser.id,
        mockCaptainUser.email,
        { inviteeUserId: inviteeUser.id }
      );

      expect(res.id).toBe('inv-1');
      expect(res.status).toBe('PENDING');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should allow invited participant to accept invitation', async () => {
      const pendingInv = {
        id: 'inv-1',
        teamId: sampleTeam.id,
        inviteeUserId: 'invitee-uuid',
        invitedByUserId: mockCaptainUser.id,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 86400000),
        team: {
          ...sampleTeam,
          hackathon: openHackathon,
          members: [{ id: 'm1', status: 'ACTIVE' }],
        },
      };

      prisma.teamInvitation.findUnique.mockResolvedValue(pendingInv);
      prisma.participantRegistration.findUnique.mockResolvedValue({ ...sampleRegistration, userId: 'invitee-uuid' });
      prisma.teamMember.findFirst.mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        if (typeof cb === 'function') {
          return cb({
            team: { update: jest.fn().mockResolvedValue({}) },
            participantRegistration: { update: jest.fn().mockResolvedValue({}) },
            teamMember: {
              findFirst: jest.fn().mockResolvedValue(null),
              count: jest.fn().mockResolvedValue(1),
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
            },
            teamInvitation: {
              update: jest.fn().mockResolvedValue({}),
              findMany: jest.fn().mockResolvedValue([]),
              updateMany: jest.fn().mockResolvedValue({}),
            },
            auditLog: { create: jest.fn().mockResolvedValue({}) },
          });
        }
        return [];
      });

      const res = await service.acceptTeamInvitation(
        'inv-1',
        'invitee-uuid',
        'invitee@mit.edu'
      );

      expect(res.success).toBe(true);
      expect(res.teamId).toBe(sampleTeam.id);
    });

    it('should reject invitation acceptance if invitee is already on another team', async () => {
      const pendingInv = {
        id: 'inv-1',
        teamId: sampleTeam.id,
        inviteeUserId: 'invitee-uuid',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 86400000),
        team: {
          ...sampleTeam,
          hackathon: openHackathon,
          members: [{ id: 'm1', status: 'ACTIVE' }],
        },
      };

      prisma.teamInvitation.findUnique.mockResolvedValue(pendingInv);
      prisma.participantRegistration.findUnique.mockResolvedValue({ ...sampleRegistration, userId: 'invitee-uuid' });
      prisma.teamMember.findFirst.mockResolvedValue({ id: 'existing-other-mem' }); // already active

      await expect(
        service.acceptTeamInvitation('inv-1', 'invitee-uuid', 'invitee@mit.edu')
      ).rejects.toThrow(ConflictException);
    });

    it('should transfer captaincy to another active member', async () => {
      const teamWithMembers = {
        ...sampleTeam,
        hackathon: openHackathon,
        members: [
          { id: 'm1', userId: mockCaptainUser.id, role: 'CAPTAIN', status: 'ACTIVE' },
          { id: 'm2', userId: 'user-b', role: 'MEMBER', status: 'ACTIVE' },
        ],
      };
      prisma.team.findUnique.mockResolvedValue(teamWithMembers);
      (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}, {}]);

      const res = await service.transferCaptaincy(
        sampleTeam.id,
        mockCaptainUser.id,
        mockCaptainUser.email,
        { targetMemberId: 'm2' }
      );

      expect(res.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should dissolve team and mark active members as left', async () => {
      const teamWithCaptain = {
        ...sampleTeam,
        hackathon: openHackathon,
        members: [{ id: 'm1', userId: mockCaptainUser.id, role: 'CAPTAIN', status: 'ACTIVE' }],
      };
      prisma.team.findUnique.mockResolvedValue(teamWithCaptain);
      (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}, {}, {}]);

      const res = await service.dissolveTeam(
        sampleTeam.id,
        mockCaptainUser.id,
        mockCaptainUser.email
      );

      expect(res.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});




