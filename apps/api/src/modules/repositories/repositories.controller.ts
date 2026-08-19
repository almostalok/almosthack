import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepositoriesService } from './repositories.service';
import { ConnectRepositoryDto } from './dto/connect-repository.dto';
import { ProvisionRepositoryDto } from './dto/provision-repository.dto';
import { connectRepositorySchema, provisionRepositorySchema } from '@almosthack/validation';

@Controller({
  version: '1',
})
@UseGuards(SessionAuthGuard)
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  /**
   * GET /api/v1/github/status
   * Gets current user's GitHub connection status.
   */
  @Get('github/status')
  public async getGitHubStatus(@CurrentUser() user: { id: string }) {
    return this.repositoriesService.getGitHubConnectionStatus(user.id);
  }

  /**
   * GET /api/v1/github/connect
   * Initiates GitHub OAuth authorization flow.
   */
  @Get('github/connect')
  public async startGitHubConnect(
    @CurrentUser() user: { id: string },
    @Query('teamId') teamId?: string,
    @Query('redirectUri') redirectUri?: string
  ) {
    return this.repositoriesService.startOAuthFlow(user.id, teamId, redirectUri);
  }

  /**
   * GET /api/v1/github/callback
   * Handles GitHub OAuth authorization callback.
   */
  @Get('github/callback')
  public async handleGitHubCallback(
    @CurrentUser() user: { id: string; email: string },
    @Query('code') code: string,
    @Query('state') state: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.repositoriesService.handleOAuthCallback(code, state, user.id, user.email);

    // If frontend redirect is expected in browser flow, redirect safely
    const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    if (result.teamId) {
      res.redirect(`${appUrl}/teams/${result.teamId}?github=connected`);
      return;
    }

    return result;
  }

  /**
   * DELETE /api/v1/github/connection
   * Unlinks current user's GitHub account and revokes credential.
   */
  @Delete('github/connection')
  public async disconnectGitHub(@CurrentUser() user: { id: string; email: string }) {
    return this.repositoriesService.disconnectGitHubAccount(user.id, user.email);
  }

  /**
   * GET /api/v1/teams/:teamId/repository
   * Gets active repository connected to a team.
   */
  @Get('teams/:teamId/repository')
  public async getTeamRepository(
    @CurrentUser() user: { id: string },
    @Param('teamId') teamId: string
  ) {
    return this.repositoriesService.getTeamRepository(teamId, user.id);
  }

  /**
   * POST /api/v1/teams/:teamId/repository/provision
   * Provisions a new GitHub repository for a team. Captain only.
   */
  @Post('teams/:teamId/repository/provision')
  public async provisionTeamRepository(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string,
    @Body() dto: ProvisionRepositoryDto
  ) {
    const parseResult = provisionRepositorySchema.safeParse(dto || {});
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_PROVISION_PAYLOAD',
        message: 'Invalid repository provisioning payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.repositoriesService.provisionTeamRepository(
      teamId,
      user.id,
      user.email,
      parseResult.data as ProvisionRepositoryDto
    );
  }

  /**
   * POST /api/v1/teams/:teamId/repository/connect
   * Connects an existing GitHub repository to a team. Captain only.
   */
  @Post('teams/:teamId/repository/connect')
  public async connectTeamRepository(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string,
    @Body() dto: ConnectRepositoryDto
  ) {
    const parseResult = connectRepositorySchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_CONNECT_PAYLOAD',
        message: 'Invalid repository connection payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.repositoriesService.connectExistingRepository(
      teamId,
      user.id,
      user.email,
      parseResult.data as ConnectRepositoryDto
    );
  }

  /**
   * DELETE /api/v1/teams/:teamId/repository
   * Disconnects repository from team. Captain only.
   */
  @Delete('teams/:teamId/repository')
  public async disconnectTeamRepository(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string
  ) {
    return this.repositoriesService.disconnectTeamRepository(teamId, user.id, user.email);
  }
}
