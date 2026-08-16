import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationRole, OrganizationMemberStatus, RoleName } from '@almosthack/types';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  const mockPrisma = {
    organization: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    organizationMember: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    jest.clearAllMocks();
  });

  describe('normalizeSlug & validateSlug', () => {
    it('should normalize company names into url-safe slugs', () => {
      expect(service.normalizeSlug('AlmostHack Community 2026')).toBe(
        'almosthack-community-2026'
      );
      expect(service.normalizeSlug('  Special & Unique   Org  ')).toBe(
        'special-unique-org'
      );
    });

    it('should throw BadRequestException on malformed slugs', () => {
      expect(() => service.validateSlug('ab')).toThrow(BadRequestException);
      expect(() => service.validateSlug('INVALID SLUG')).toThrow(BadRequestException);
      expect(() => service.validateSlug('../admin')).toThrow(BadRequestException);
    });
  });

  describe('createOrganization', () => {
    it('should create an organization and assign creator as OWNER transactionally', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      const createdOrg = {
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        description: null,
        logoUrl: null,
        websiteUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.organization.create.mockResolvedValue(createdOrg);
      mockPrisma.organizationMember.create.mockResolvedValue({
        id: 'mem-1',
        organizationId: 'org-1',
        userId: 'user-1',
        role: OrganizationRole.OWNER,
        status: OrganizationMemberStatus.ACTIVE,
      });

      const res = await service.createOrganization('user-1', 'user@test.com', {
        name: 'Test Org',
      });

      expect(res.id).toBe('org-1');
      expect(res.slug).toBe('test-org');
      expect(mockPrisma.organizationMember.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: 'org-1',
          userId: 'user-1',
          role: OrganizationRole.OWNER,
        }),
      });
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if requested slug already exists', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.createOrganization('user-1', 'user@test.com', {
          name: 'Test Org',
          slug: 'existing-slug',
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getOrganizationById & membership authorization', () => {
    it('should return org details if user is an active member', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({
        id: 'org-1',
        slug: 'org-1',
        name: 'Org 1',
      });
      mockPrisma.organizationMember.findFirst.mockResolvedValue({
        id: 'mem-1',
        organizationId: 'org-1',
        userId: 'user-1',
        role: OrganizationRole.MEMBER,
        status: OrganizationMemberStatus.ACTIVE,
      });

      const res = await service.getOrganizationById('org-1', 'user-1');
      expect(res.id).toBe('org-1');
    });

    it('should throw ForbiddenException if user is not a member and not platform admin', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({
        id: 'org-1',
        slug: 'org-1',
        name: 'Org 1',
      });
      mockPrisma.organizationMember.findFirst.mockResolvedValue(null);

      await expect(
        service.getOrganizationById('org-1', 'user-2', [RoleName.PARTICIPANT])
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addMember', () => {
    it('should prevent adding user who is already an active member', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-1' });
      mockPrisma.organizationMember.findFirst.mockImplementation(({ where }) => {
        if (where.userId === 'caller-1') {
          return Promise.resolve({ role: OrganizationRole.OWNER, status: OrganizationMemberStatus.ACTIVE });
        }
        if (where.userId === 'target-1') {
          return Promise.resolve({ role: OrganizationRole.MEMBER, status: OrganizationMemberStatus.ACTIVE });
        }
        return Promise.resolve(null);
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'target-1', name: 'Target User' });

      await expect(
        service.addMember('org-1', 'caller-1', 'caller@test.com', [], {
          userId: 'target-1',
          role: OrganizationRole.MEMBER,
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('removeMember & Last Owner Invariant', () => {
    it('should prevent removing the last owner of an organization', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-1' });
      mockPrisma.organizationMember.findFirst.mockResolvedValue({
        id: 'mem-owner',
        organizationId: 'org-1',
        userId: 'owner-1',
        role: OrganizationRole.OWNER,
        status: OrganizationMemberStatus.ACTIVE,
      });
      mockPrisma.organizationMember.count.mockResolvedValue(1);

      await expect(
        service.removeMember('org-1', 'owner-1', 'owner@test.com', [], 'owner-1')
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('transferOwnership', () => {
    it('should atomically swap owner role to target member and demote old owner to admin', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-1' });
      mockPrisma.organizationMember.findFirst.mockImplementation(({ where }) => {
        if (where.userId === 'owner-1') {
          return Promise.resolve({
            id: 'mem-owner-1',
            organizationId: 'org-1',
            userId: 'owner-1',
            role: OrganizationRole.OWNER,
            status: OrganizationMemberStatus.ACTIVE,
          });
        }
        if (where.userId === 'member-2') {
          return Promise.resolve({
            id: 'mem-member-2',
            organizationId: 'org-1',
            userId: 'member-2',
            role: OrganizationRole.MEMBER,
            status: OrganizationMemberStatus.ACTIVE,
          });
        }
        return Promise.resolve(null);
      });

      const res = await service.transferOwnership(
        'org-1',
        'owner-1',
        'owner@test.com',
        [],
        { newOwnerId: 'member-2' }
      );

      expect(res.success).toBe(true);
      expect(mockPrisma.organizationMember.update).toHaveBeenCalledWith({
        where: { id: 'mem-member-2' },
        data: { role: OrganizationRole.OWNER },
      });
      expect(mockPrisma.organizationMember.update).toHaveBeenCalledWith({
        where: { id: 'mem-owner-1' },
        data: { role: OrganizationRole.ADMIN },
      });
    });
  });
});
