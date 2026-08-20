import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResultsService } from './results.service';
import { CalculateResultsDto, ApproveResultsDto, PublishResultsDto } from './dto/results.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import {
  calculateResultsSchema,
  approveResultsSchema,
  publishResultsSchema,
  leaderboardQuerySchema,
} from '@almosthack/validation';

@Controller({
  version: '1',
})
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  /**
   * POST /api/v1/hackathons/:hackathonId/results/calculate
   * Triggers deterministic results calculation & snapshot creation. Organizer only.
   */
  @Post('hackathons/:hackathonId/results/calculate')
  @UseGuards(SessionAuthGuard)
  public async calculateResults(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string,
    @Body() dto?: CalculateResultsDto
  ) {
    const parseResult = calculateResultsSchema.safeParse(dto || {});
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_CALCULATE_PAYLOAD',
        message: 'Invalid calculate payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.resultsService.calculateResults(hackathonId, user.id, user.email, parseResult.data);
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/results
   * Gets current active / latest result set with full breakdown. Organizer only.
   */
  @Get('hackathons/:hackathonId/results')
  @UseGuards(SessionAuthGuard)
  public async getLatestResults(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.resultsService.getLatestResultSet(hackathonId, user.id);
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/results/history
   * Gets all historical result set snapshots. Organizer only.
   */
  @Get('hackathons/:hackathonId/results/history')
  @UseGuards(SessionAuthGuard)
  public async getResultHistory(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.resultsService.getResultSetHistory(hackathonId, user.id);
  }

  /**
   * POST /api/v1/hackathons/:hackathonId/results/approve
   * Organizers approve calculated results after review. Enforces staleness checks.
   */
  @Post('hackathons/:hackathonId/results/approve')
  @UseGuards(SessionAuthGuard)
  public async approveResults(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string,
    @Body() dto?: ApproveResultsDto
  ) {
    const parseResult = approveResultsSchema.safeParse(dto || {});
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_APPROVE_PAYLOAD',
        message: 'Invalid approval payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.resultsService.approveResults(hackathonId, user.id, user.email, parseResult.data);
  }

  /**
   * POST /api/v1/hackathons/:hackathonId/results/publish
   * Organizers publish approved results to the public leaderboard.
   */
  @Post('hackathons/:hackathonId/results/publish')
  @UseGuards(SessionAuthGuard)
  public async publishResults(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string,
    @Body() dto?: PublishResultsDto
  ) {
    const parseResult = publishResultsSchema.safeParse(dto || {});
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_PUBLISH_PAYLOAD',
        message: 'Invalid publish payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.resultsService.publishResults(hackathonId, user.id, user.email, parseResult.data);
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/leaderboard
   * Public / Participant accessible leaderboard projection.
   * Only returns data once results are PUBLISHED.
   */
  @Get('hackathons/:hackathonId/leaderboard')
  public async getLeaderboard(
    @Param('hackathonId') hackathonId: string,
    @Query() query?: LeaderboardQueryDto
  ) {
    const parseResult = leaderboardQuerySchema.safeParse(query || {});
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_LEADERBOARD_QUERY',
        message: 'Invalid leaderboard query parameters',
        details: parseResult.error.flatten(),
      });
    }

    return this.resultsService.getLeaderboard(hackathonId, parseResult.data);
  }
}
