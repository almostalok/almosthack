import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationService } from './authorization.service';
import { PrismaService } from '../../database/prisma.service';
import { RoleName, Permission, ScopeType } from '@almosthack/types';
import { ForbiddenException } from '@nestjs/common';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildContext', () => {
    it('should build context with permissions mapped from roles', () => {
      const context = service.buildContext({
        id: 'usr-1',
        roles: [RoleName.PARTICIPANT],
      });

      expect(context.userId).toBe('usr-1');
      expect(context.roles).toEqual([RoleName.PARTICIPANT]);
      expect(context.permissions).toContain(Permission.PROFILE_READ_SELF);
      expect(context.permissions).toContain(Permission.SUBMISSION_CREATE);
      expect(context.permissions).not.toContain(Permission.SYSTEM_MANAGE);
    });
  });

  describe('role evaluation', () => {
    const user = { id: 'usr-1', roles: [RoleName.ORGANIZER, RoleName.JUDGE] };

    it('should check single role via hasRole', () => {
      expect(service.hasRole(user, RoleName.ORGANIZER)).toBe(true);
      expect(service.hasRole(user, RoleName.ADMIN)).toBe(false);
    });

    it('should evaluate multiple roles with OR mode', () => {
      expect(service.hasAnyRole(user, [RoleName.ADMIN, RoleName.ORGANIZER])).toBe(true);
      expect(service.hasAnyRole(user, [RoleName.ADMIN, RoleName.SPONSOR])).toBe(false);
    });

    it('should evaluate multiple roles with AND mode', () => {
      expect(service.hasAllRoles(user, [RoleName.ORGANIZER, RoleName.JUDGE])).toBe(true);
      expect(service.hasAllRoles(user, [RoleName.ORGANIZER, RoleName.ADMIN])).toBe(false);
    });
  });

  describe('permission evaluation & wildcard hardening', () => {
    const participant = { id: 'p-1', roles: [RoleName.PARTICIPANT] };
    const admin = { id: 'a-1', roles: [RoleName.ADMIN] };
    const organizer = { id: 'o-1', roles: [RoleName.ORGANIZER] };

    it('should evaluate permissions based on explicit role mapping', () => {
      expect(service.hasPermission(participant, Permission.PROFILE_READ_SELF)).toBe(true);
      expect(service.hasPermission(participant, Permission.SYSTEM_MANAGE)).toBe(false);

      expect(service.hasPermission(admin, Permission.SYSTEM_MANAGE)).toBe(true);
    });

    it('should deny unknown/unregistered permission even for ADMIN role (no superuser bypass)', () => {
      const unknownPermission = 'unknown:unregistered_action' as any;
      expect(service.hasPermission(admin, unknownPermission)).toBe(false);
      expect(service.can(admin, unknownPermission)).toBe(false);
    });

    it('should NOT automatically grant a new permission to ORGANIZER or other roles unless explicitly assigned', () => {
      const newUnassignedPermission = 'future_domain:action' as any;

      expect(service.hasPermission(organizer, newUnassignedPermission)).toBe(false);
      expect(service.hasPermission(participant, newUnassignedPermission)).toBe(false);
    });

    it('should evaluate multiple permissions with AND mode', () => {
      expect(
        service.hasAllPermissions(participant, [
          Permission.PROFILE_READ_SELF,
          Permission.PROFILE_UPDATE_SELF,
        ])
      ).toBe(true);

      expect(
        service.hasAllPermissions(participant, [
          Permission.PROFILE_READ_SELF,
          Permission.SYSTEM_MANAGE,
        ])
      ).toBe(false);
    });

    it('should evaluate multiple permissions with OR mode', () => {
      expect(
        service.hasAnyPermission(participant, [
          Permission.SYSTEM_MANAGE,
          Permission.PROFILE_READ_SELF,
        ])
      ).toBe(true);
    });
  });

  describe('can & assertPermission & scope safety', () => {
    const user = { id: 'u-1', roles: [RoleName.PARTICIPANT] };
    const organizer = { id: 'org-1', roles: [RoleName.ORGANIZER] };

    it('should return true for valid permission and global scope', () => {
      expect(
        service.can(user, Permission.PROFILE_READ_SELF, { type: ScopeType.GLOBAL })
      ).toBe(true);
    });

    it('should evaluate permission + scope contract without implying resource ownership', () => {
      const hackathonScope = { type: ScopeType.HACKATHON, id: 'hackathon-999' };

      // Explicit permission + scope contract contract evaluates true
      expect(service.can(organizer, Permission.HACKATHON_UPDATE, hackathonScope)).toBe(true);
      // Unassigned permission under same scope contract fails closed
      expect(service.can(organizer, Permission.SYSTEM_MANAGE, hackathonScope)).toBe(false);
    });

    it('should return false for missing permission', () => {
      expect(service.can(user, Permission.SYSTEM_MANAGE)).toBe(false);
    });

    it('should throw ForbiddenException in assertPermission when missing permission', () => {
      expect(() =>
        service.assertPermission(user, Permission.SYSTEM_MANAGE)
      ).toThrow(ForbiddenException);
    });
  });

  describe('logDenied', () => {
    it('should write to auditLog when authorization is denied', async () => {
      await service.logDenied('usr-1', 'test@example.com', '/api/v1/admin', {
        reason: 'Forbidden',
      });

      expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorId: 'usr-1',
          actorEmail: 'test@example.com',
          action: 'AUTHORIZATION_DENIED',
        }),
      });
    });
  });
});
