import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed-secret',
    avatarUrl: 'https://example.com/avatar.jpg',
    bio: 'Initial bio',
    college: 'MIT',
    branch: 'Computer Science',
    graduationYear: 2026,
    skills: ['React', 'NodeJS'],
    githubUsername: 'testuser',
    linkedinUrl: 'https://linkedin.com/in/testuser',
    portfolioUrl: 'https://testuser.dev',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
    userRoles: [{ role: { name: 'PARTICIPANT' } }],
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return safe user profile when user exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const profile = await service.getProfile('user-123');

      expect(profile).toBeDefined();
      expect(profile.id).toBe('user-123');
      expect(profile.email).toBe('test@example.com');
      expect(profile.name).toBe('Test User');
      expect(profile.college).toBe('MIT');
      expect(profile.skills).toEqual(['React', 'NodeJS']);
      expect(profile.roles).toEqual(['PARTICIPANT']);
      expect((profile as any).passwordHash).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should perform partial update and retain untouched existing fields', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      const updated = await service.updateProfile('user-123', {
        name: 'Updated Name',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: 'Updated Name' },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
      expect(updated.name).toBe('Updated Name');
      expect(updated.bio).toBe('Initial bio');
    });

    it('should normalize and update skills when provided', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        skills: ['React', 'TypeScript', 'NestJS'],
      });

      const updated = await service.updateProfile('user-123', {
        skills: ['React', 'TypeScript', 'NestJS'],
      });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            skills: ['React', 'TypeScript', 'NestJS'],
          }),
        })
      );
      expect(updated.skills).toEqual(['React', 'TypeScript', 'NestJS']);
    });
  });

  describe('toUserProfileResponse', () => {
    it('should never expose sensitive password or internal properties', () => {
      const response = service.toUserProfileResponse(mockUser as any);
      expect(response.id).toBe('user-123');
      expect((response as any).passwordHash).toBeUndefined();
      expect((response as any).sessions).toBeUndefined();
    });
  });
});
