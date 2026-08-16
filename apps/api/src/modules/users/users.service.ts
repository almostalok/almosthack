import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RoleName } from '@almosthack/types';

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  college: string | null;
  branch: string | null;
  graduationYear: number | null;
  skills: string[];
  githubUsername: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  roles: RoleName[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Safe mapping function ensuring sensitive fields (passwordHash, sessions) are never returned.
   */
  public toUserProfileResponse(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
    bio?: string | null;
    college?: string | null;
    branch?: string | null;
    graduationYear?: number | null;
    skills?: string[];
    githubUsername?: string | null;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    userRoles?: Array<{ role: { name: string } }>;
  }): UserProfileResponse {
    const roles: RoleName[] = user.userRoles
      ? user.userRoles.map((ur) => ur.role.name as RoleName)
      : [RoleName.PARTICIPANT];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      bio: user.bio ?? null,
      college: user.college ?? null,
      branch: user.branch ?? null,
      graduationYear: user.graduationYear ?? null,
      skills: user.skills || [],
      githubUsername: user.githubUsername ?? null,
      linkedinUrl: user.linkedinUrl ?? null,
      portfolioUrl: user.portfolioUrl ?? null,
      roles,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  public async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
        },
      });
    }

    return this.toUserProfileResponse(user);
  }

  public async updateProfile(
    userId: string,
    dto: UpdateProfileDto
  ): Promise<UserProfileResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!existingUser) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
        },
      });
    }

    // Build partial update data object cleanly omitting undefined fields
    const dataToUpdate: Record<string, any> = {};

    if (dto.name !== undefined) dataToUpdate.name = dto.name;
    if (dto.avatarUrl !== undefined) dataToUpdate.avatarUrl = dto.avatarUrl;
    if (dto.bio !== undefined) dataToUpdate.bio = dto.bio;
    if (dto.college !== undefined) dataToUpdate.college = dto.college;
    if (dto.branch !== undefined) dataToUpdate.branch = dto.branch;
    if (dto.graduationYear !== undefined) dataToUpdate.graduationYear = dto.graduationYear;
    if (dto.skills !== undefined) dataToUpdate.skills = dto.skills;
    if (dto.githubUsername !== undefined) dataToUpdate.githubUsername = dto.githubUsername;
    if (dto.linkedinUrl !== undefined) dataToUpdate.linkedinUrl = dto.linkedinUrl;
    if (dto.portfolioUrl !== undefined) dataToUpdate.portfolioUrl = dto.portfolioUrl;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Record audit log entry safely
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: existingUser.id,
          actorEmail: existingUser.email,
          action: 'PROFILE_UPDATED',
          targetEntity: 'User',
          targetId: existingUser.id,
          metadata: {
            updatedFields: Object.keys(dataToUpdate),
          },
        },
      });
    } catch {
      // Audit log failures should not block profile update transaction
    }

    return this.toUserProfileResponse(updatedUser);
  }
}
