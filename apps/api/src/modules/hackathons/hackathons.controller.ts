import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { RoleName, Permission, ScopeType } from '@almosthack/types';
import {
  createHackathonSchema,
  updateHackathonSchema,
  updateHackathonConfigurationSchema,
  updateHackathonRulesSchema,
  createTrackSchema,
  updateTrackSchema,
  reorderTracksSchema,
  createChallengeSchema,
  updateChallengeSchema,
  reorderChallengesSchema,
  createParticipantRegistrationSchema,
  updateParticipantRegistrationSchema,
  createTeamSchema,
  updateTeamSchema,
  inviteTeamMemberSchema,
  transferCaptaincySchema,
} from '@almosthack/validation';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions as Permissions } from '../auth/decorators/permissions.decorator';
import { RequireScope as Scope } from '../auth/decorators/scope.decorator';
import { HackathonsService } from './hackathons.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import {
  UpdateHackathonConfigurationDto,
  UpdateHackathonRulesDto,
} from './dto/hackathon-configuration.dto';
import {
  CreateTrackDto,
  UpdateTrackDto,
  ReorderTracksDto,
} from './dto/track.dto';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  ReorderChallengesDto,
} from './dto/challenge.dto';
import {
  CreateParticipantRegistrationDto,
  UpdateParticipantRegistrationDto,
} from './dto/registration.dto';
import {
  CreateTeamDto,
  UpdateTeamDto,
  InviteTeamMemberDto,
  TransferCaptaincyDto,
} from './dto/team.dto';

@Controller()
@UseGuards(SessionAuthGuard, PermissionsGuard)
export class HackathonsController {
  constructor(private readonly hackathonsService: HackathonsService) {}

  /**
   * POST /api/v1/organizations/:organizationId/hackathons
   * Creates a new hackathon scoped under an organization.
   */
  @Post('organizations/:organizationId/hackathons')
  @Permissions(Permission.HACKATHON_CREATE)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async create(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateHackathonDto
  ) {
    const parseResult = createHackathonSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid hackathon creation payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.createHackathon(
      user.id,
      user.roles,
      user.email,
      organizationId,
      dto
    );
  }

  /**
   * GET /api/v1/organizations/:organizationId/hackathons
   * Lists all hackathons owned by an organization.
   */
  @Get('organizations/:organizationId/hackathons')
  @Permissions(Permission.HACKATHON_READ)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async listOrganizationHackathons(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('organizationId') organizationId: string
  ) {
    return this.hackathonsService.getOrganizationHackathons(
      user.id,
      user.roles,
      organizationId
    );
  }

  /**
   * GET /api/v1/hackathons/:hackathonId
   * Retrieves a single hackathon.
   */
  @Get('hackathons/:hackathonId')
  @Permissions(Permission.HACKATHON_READ)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async getHackathon(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.getHackathon(
      user.id,
      user.roles,
      hackathonId
    );
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/lifecycle
   * Exposes effective hackathon lifecycle status & registration window status.
   */
  @Get('hackathons/:hackathonId/lifecycle')
  @Permissions(Permission.HACKATHON_READ)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async getLifecycle(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.getLifecycle(
      user.id,
      user.roles,
      hackathonId
    );
  }

  /**
   * PATCH /api/v1/hackathons/:hackathonId
   * Updates allowed hackathon fields.
   */
  @Patch('hackathons/:hackathonId')
  @Permissions(Permission.HACKATHON_UPDATE)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async update(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string,
    @Body() dto: UpdateHackathonDto
  ) {
    // Explicitly reject direct lifecycle state mutation attempts
    const rawBody = dto as Record<string, any>;
    if (
      rawBody.status !== undefined ||
      rawBody.publishedAt !== undefined ||
      rawBody.completedAt !== undefined ||
      rawBody.archivedAt !== undefined ||
      rawBody.organizationId !== undefined
    ) {
      throw new BadRequestException({
        code: 'INVALID_FIELD_MUTATION',
        message: 'Status and lifecycle fields cannot be modified through generic update.',
      });
    }

    const parseResult = updateHackathonSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid hackathon update payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.updateHackathon(
      user.id,
      user.roles,
      user.email,
      hackathonId,
      dto
    );
  }

  /**
   * POST /api/v1/hackathons/:hackathonId/publish
   * Publishes a DRAFT hackathon.
   */
  @Post('hackathons/:hackathonId/publish')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.HACKATHON_PUBLISH)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async publish(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.publishHackathon(
      user.id,
      user.roles,
      user.email,
      hackathonId
    );
  }

  /**
   * POST /api/v1/hackathons/:hackathonId/archive
   * Archives a COMPLETED hackathon.
   */
  @Post('hackathons/:hackathonId/archive')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.HACKATHON_ARCHIVE)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async archive(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.archiveHackathon(
      user.id,
      user.roles,
      user.email,
      hackathonId
    );
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/configuration
   * Retrieves full hackathon policy configuration.
   */
  @Get('hackathons/:hackathonId/configuration')
  @Permissions(Permission.HACKATHON_READ)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async getConfiguration(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.getHackathonConfiguration(
      user.id,
      user.roles,
      hackathonId
    );
  }

  /**
   * PUT /api/v1/hackathons/:hackathonId/configuration
   * Updates hackathon policy configuration.
   */
  @Put('hackathons/:hackathonId/configuration')
  @Permissions(Permission.HACKATHON_UPDATE)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async updateConfiguration(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string,
    @Body() dto: UpdateHackathonConfigurationDto
  ) {
    const parseResult = updateHackathonConfigurationSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_HACKATHON_CONFIGURATION',
        message: 'Invalid configuration payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.updateHackathonConfiguration(
      user.id,
      user.roles,
      user.email,
      hackathonId,
      parseResult.data as any
    );
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/rules
   * Retrieves participant-facing rules and policy overview.
   */
  @Get('hackathons/:hackathonId/rules')
  @Permissions(Permission.HACKATHON_READ)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async getRules(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.getHackathonRules(
      user?.id,
      user?.roles,
      hackathonId
    );
  }

  /**
   * PATCH /api/v1/hackathons/:hackathonId/rules
   * Updates participant-facing human-readable markdown rules.
   */
  @Patch('hackathons/:hackathonId/rules')
  @Permissions(Permission.HACKATHON_UPDATE)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async updateRules(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string,
    @Body() dto: UpdateHackathonRulesDto
  ) {
    const parseResult = updateHackathonRulesSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_RULES_CONTENT',
        message: 'Invalid rules markdown payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.updateHackathonRules(
      user.id,
      user.roles,
      user.email,
      hackathonId,
      dto
    );
  }

  // ==========================================
  // S2-03: TRACKS CONTROLLER ENDPOINTS
  // ==========================================

  /**
   * GET /api/v1/hackathons/:hackathonId/tracks
   * Lists all tracks for a hackathon.
   */
  @Get('hackathons/:hackathonId/tracks')
  @Permissions(Permission.HACKATHON_READ)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async getTracks(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.getHackathonTracks(
      user?.id,
      user?.roles,
      hackathonId
    );
  }

  /**
   * POST /api/v1/hackathons/:hackathonId/tracks
   * Creates a new track inside a hackathon.
   */
  @Post('hackathons/:hackathonId/tracks')
  @Permissions(Permission.HACKATHON_UPDATE)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async createTrack(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string,
    @Body() dto: CreateTrackDto
  ) {
    const parseResult = createTrackSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_TRACK_PAYLOAD',
        message: 'Invalid track creation payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.createHackathonTrack(
      user.id,
      user.roles,
      user.email,
      hackathonId,
      parseResult.data as CreateTrackDto
    );
  }

  /**
   * PATCH /api/v1/hackathons/:hackathonId/tracks/reorder
   * Atomically reorders tracks within a hackathon.
   */
  @Patch('hackathons/:hackathonId/tracks/reorder')
  @Permissions(Permission.HACKATHON_UPDATE)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async reorderTracks(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string,
    @Body() dto: ReorderTracksDto
  ) {
    const parseResult = reorderTracksSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_REORDER_PAYLOAD',
        message: 'Invalid track reorder payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.reorderHackathonTracks(
      user.id,
      user.roles,
      user.email,
      hackathonId,
      parseResult.data as ReorderTracksDto
    );
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/tracks/:trackId
   * Gets specific track details and its challenges.
   */
  @Get('hackathons/:hackathonId/tracks/:trackId')
  @Permissions(Permission.HACKATHON_READ)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async getTrack(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string,
    @Param('trackId') trackId: string
  ) {
    return this.hackathonsService.getHackathonTrack(
      user?.id,
      user?.roles,
      hackathonId,
      trackId
    );
  }

  /**
   * PATCH /api/v1/hackathons/:hackathonId/tracks/:trackId
   * Updates a track.
   */
  @Patch('hackathons/:hackathonId/tracks/:trackId')
  @Permissions(Permission.HACKATHON_UPDATE)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async updateTrack(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string,
    @Param('trackId') trackId: string,
    @Body() dto: UpdateTrackDto
  ) {
    const parseResult = updateTrackSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_TRACK_PAYLOAD',
        message: 'Invalid track update payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.updateHackathonTrack(
      user.id,
      user.roles,
      user.email,
      hackathonId,
      trackId,
      parseResult.data as UpdateTrackDto
    );
  }

  /**
   * DELETE /api/v1/hackathons/:hackathonId/tracks/:trackId
   * Deletes a track and cascades its challenges.
   */
  @Delete('hackathons/:hackathonId/tracks/:trackId')
  @Permissions(Permission.HACKATHON_UPDATE)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async deleteTrack(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string,
    @Param('trackId') trackId: string
  ) {
    return this.hackathonsService.deleteHackathonTrack(
      user.id,
      user.roles,
      user.email,
      hackathonId,
      trackId
    );
  }

  // ==========================================
  // S2-03: CHALLENGES CONTROLLER ENDPOINTS
  // ==========================================

  /**
   * GET /api/v1/tracks/:trackId/challenges
   * Lists all challenges for a track.
   */
  @Get('tracks/:trackId/challenges')
  public async getChallenges(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('trackId') trackId: string
  ) {
    return this.hackathonsService.getTrackChallenges(
      user?.id,
      user?.roles,
      trackId
    );
  }

  /**
   * POST /api/v1/tracks/:trackId/challenges
   * Creates a challenge within a track.
   */
  @Post('tracks/:trackId/challenges')
  public async createChallenge(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('trackId') trackId: string,
    @Body() dto: CreateChallengeDto
  ) {
    const parseResult = createChallengeSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_CHALLENGE_PAYLOAD',
        message: 'Invalid challenge creation payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.createTrackChallenge(
      user.id,
      user.roles,
      user.email,
      trackId,
      parseResult.data as CreateChallengeDto
    );
  }

  /**
   * PATCH /api/v1/tracks/:trackId/challenges/reorder
   * Atomically reorders challenges within a track.
   */
  @Patch('tracks/:trackId/challenges/reorder')
  public async reorderChallenges(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('trackId') trackId: string,
    @Body() dto: ReorderChallengesDto
  ) {
    const parseResult = reorderChallengesSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_REORDER_PAYLOAD',
        message: 'Invalid challenge reorder payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.reorderTrackChallenges(
      user.id,
      user.roles,
      user.email,
      trackId,
      parseResult.data as ReorderChallengesDto
    );
  }

  /**
   * GET /api/v1/tracks/:trackId/challenges/:challengeId
   * Gets specific challenge details.
   */
  @Get('tracks/:trackId/challenges/:challengeId')
  public async getChallenge(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('trackId') trackId: string,
    @Param('challengeId') challengeId: string
  ) {
    return this.hackathonsService.getTrackChallenge(
      user?.id,
      user?.roles,
      trackId,
      challengeId
    );
  }

  /**
   * PATCH /api/v1/tracks/:trackId/challenges/:challengeId
   * Updates a challenge.
   */
  @Patch('tracks/:trackId/challenges/:challengeId')
  public async updateChallenge(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('trackId') trackId: string,
    @Param('challengeId') challengeId: string,
    @Body() dto: UpdateChallengeDto
  ) {
    const parseResult = updateChallengeSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_CHALLENGE_PAYLOAD',
        message: 'Invalid challenge update payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.updateTrackChallenge(
      user.id,
      user.roles,
      user.email,
      trackId,
      challengeId,
      parseResult.data as UpdateChallengeDto
    );
  }

  /**
   * DELETE /api/v1/tracks/:trackId/challenges/:challengeId
   * Deletes a challenge.
   */
  @Delete('tracks/:trackId/challenges/:challengeId')
  public async deleteChallenge(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('trackId') trackId: string,
    @Param('challengeId') challengeId: string
  ) {
    return this.hackathonsService.deleteTrackChallenge(
      user.id,
      user.roles,
      user.email,
      trackId,
      challengeId
    );
  }

  // ====================================================
  // S2-04: PARTICIPANT REGISTRATION CONTROLLER ENDPOINTS
  // ====================================================

  /**
   * GET /api/v1/hackathons/:hackathonId/registration
   * Gets current user's registration for a hackathon.
   */
  @Get('hackathons/:hackathonId/registration')
  public async getRegistration(
    @CurrentUser() user: { id: string },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.getParticipantRegistration(user.id, hackathonId);
  }

  /**
   * POST /api/v1/hackathons/:hackathonId/registration
   * Registers current user for a hackathon.
   */
  @Post('hackathons/:hackathonId/registration')
  public async registerParticipant(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string,
    @Body() dto: CreateParticipantRegistrationDto
  ) {
    const parseResult = createParticipantRegistrationSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_REGISTRATION_PAYLOAD',
        message: 'Invalid registration payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.createParticipantRegistration(
      user.id,
      user.email,
      hackathonId,
      parseResult.data as CreateParticipantRegistrationDto
    );
  }

  /**
   * PATCH /api/v1/hackathons/:hackathonId/registration
   * Updates current user's registration track/challenge selections.
   */
  @Patch('hackathons/:hackathonId/registration')
  public async updateRegistration(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string,
    @Body() dto: UpdateParticipantRegistrationDto
  ) {
    const parseResult = updateParticipantRegistrationSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_REGISTRATION_PAYLOAD',
        message: 'Invalid registration update payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.updateParticipantRegistration(
      user.id,
      user.email,
      hackathonId,
      parseResult.data as UpdateParticipantRegistrationDto
    );
  }

  /**
   * DELETE /api/v1/hackathons/:hackathonId/registration
   * Withdraws current user's registration from a hackathon.
   */
  @Delete('hackathons/:hackathonId/registration')
  public async withdrawRegistration(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.withdrawParticipantRegistration(
      user.id,
      user.email,
      hackathonId
    );
  }

  // ====================================================
  // S2-05: TEAMS & TEAM FORMATION CONTROLLER ENDPOINTS
  // ====================================================

  /**
   * POST /api/v1/hackathons/:hackathonId/teams
   * Creates a new team in the hackathon. Creator automatically becomes CAPTAIN.
   */
  @Post('hackathons/:hackathonId/teams')
  public async createTeam(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string,
    @Body() dto: CreateTeamDto
  ) {
    const parseResult = createTeamSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_TEAM_PAYLOAD',
        message: 'Invalid team creation payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.createTeam(
      hackathonId,
      user.id,
      user.email,
      parseResult.data as CreateTeamDto
    );
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/teams/me
   * Gets current user's active team in this hackathon.
   */
  @Get('hackathons/:hackathonId/teams/me')
  public async getMyTeam(
    @CurrentUser() user: { id: string },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.getMyTeam(hackathonId, user.id);
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/teams/my-invitations
   * Gets pending invitations for current user in this hackathon.
   */
  @Get('hackathons/:hackathonId/teams/my-invitations')
  public async getMyTeamInvitations(
    @CurrentUser() user: { id: string },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.getMyTeamInvitations(hackathonId, user.id);
  }

  /**
   * GET /api/v1/teams/:teamId
   * Gets a team by ID.
   */
  @Get('teams/:teamId')
  public async getTeam(
    @CurrentUser() user: { id: string },
    @Param('teamId') teamId: string
  ) {
    return this.hackathonsService.getTeamById(teamId, user.id);
  }

  /**
   * PATCH /api/v1/teams/:teamId
   * Updates team details (name, slug, description). Captain only.
   */
  @Patch('teams/:teamId')
  public async updateTeam(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto
  ) {
    const parseResult = updateTeamSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_TEAM_PAYLOAD',
        message: 'Invalid team update payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.updateTeam(
      teamId,
      user.id,
      user.email,
      parseResult.data as UpdateTeamDto
    );
  }

  /**
   * DELETE /api/v1/teams/:teamId
   * Dissolves a team. Captain only.
   */
  @Delete('teams/:teamId')
  public async dissolveTeam(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string
  ) {
    return this.hackathonsService.dissolveTeam(teamId, user.id, user.email);
  }

  /**
   * POST /api/v1/teams/:teamId/invitations
   * Invites a participant to the team. Captain only.
   */
  @Post('teams/:teamId/invitations')
  public async inviteTeamMember(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string,
    @Body() dto: InviteTeamMemberDto
  ) {
    const parseResult = inviteTeamMemberSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_INVITATION_PAYLOAD',
        message: 'Invalid team invitation payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.inviteTeamMember(
      teamId,
      user.id,
      user.email,
      parseResult.data as InviteTeamMemberDto
    );
  }

  /**
   * GET /api/v1/teams/:teamId/invitations
   * Gets pending invitations for a team. Captain only.
   */
  @Get('teams/:teamId/invitations')
  public async getTeamInvitations(
    @CurrentUser() user: { id: string },
    @Param('teamId') teamId: string
  ) {
    return this.hackathonsService.getTeamInvitations(teamId, user.id);
  }

  /**
   * DELETE /api/v1/teams/:teamId/invitations/:invitationId
   * Cancels a pending team invitation. Captain only.
   */
  @Delete('teams/:teamId/invitations/:invitationId')
  public async cancelTeamInvitation(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string,
    @Param('invitationId') invitationId: string
  ) {
    return this.hackathonsService.cancelTeamInvitation(
      teamId,
      invitationId,
      user.id,
      user.email
    );
  }

  /**
   * POST /api/v1/invitations/:invitationId/accept
   * Accepts a team invitation. Invitee only.
   */
  @Post('invitations/:invitationId/accept')
  @HttpCode(HttpStatus.OK)
  public async acceptTeamInvitation(
    @CurrentUser() user: { id: string; email: string },
    @Param('invitationId') invitationId: string
  ) {
    return this.hackathonsService.acceptTeamInvitation(
      invitationId,
      user.id,
      user.email
    );
  }

  /**
   * POST /api/v1/invitations/:invitationId/decline
   * Declines a team invitation. Invitee only.
   */
  @Post('invitations/:invitationId/decline')
  @HttpCode(HttpStatus.OK)
  public async declineTeamInvitation(
    @CurrentUser() user: { id: string; email: string },
    @Param('invitationId') invitationId: string
  ) {
    return this.hackathonsService.declineTeamInvitation(
      invitationId,
      user.id,
      user.email
    );
  }

  /**
   * POST /api/v1/teams/:teamId/leave
   * Leaves a team. Active member (non-captain) only.
   */
  @Post('teams/:teamId/leave')
  @HttpCode(HttpStatus.OK)
  public async leaveTeam(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string
  ) {
    return this.hackathonsService.leaveTeam(teamId, user.id, user.email);
  }

  /**
   * POST /api/v1/teams/:teamId/members/:memberId/remove
   * Removes a member from the team. Captain only.
   */
  @Post('teams/:teamId/members/:memberId/remove')
  @HttpCode(HttpStatus.OK)
  public async removeTeamMember(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string
  ) {
    return this.hackathonsService.removeTeamMember(
      teamId,
      memberId,
      user.id,
      user.email
    );
  }

  /**
   * POST /api/v1/teams/:teamId/captain/transfer
   * Transfers captaincy to another active member. Captain only.
   */
  @Post('teams/:teamId/captain/transfer')
  @HttpCode(HttpStatus.OK)
  public async transferCaptaincy(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string,
    @Body() dto: TransferCaptaincyDto
  ) {
    const parseResult = transferCaptaincySchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_TRANSFER_PAYLOAD',
        message: 'Invalid captain transfer payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.transferCaptaincy(
      teamId,
      user.id,
      user.email,
      parseResult.data as TransferCaptaincyDto
    );
  }
}



