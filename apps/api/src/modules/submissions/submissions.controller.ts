import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { createSubmissionSchema } from '@almosthack/validation';

@Controller({
  version: '1',
})
@UseGuards(SessionAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  /**
   * POST /api/v1/teams/:teamId/submissions
   * Creates or updates draft submission for a team.
   */
  @Post('teams/:teamId/submissions')
  public async createOrUpdateDraft(
    @CurrentUser() user: { id: string; email: string },
    @Param('teamId') teamId: string,
    @Body() dto: CreateSubmissionDto
  ) {
    const parseResult = createSubmissionSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_SUBMISSION_PAYLOAD',
        message: 'Invalid submission payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.submissionsService.createOrUpdateDraft(
      teamId,
      user.id,
      user.email,
      parseResult.data as CreateSubmissionDto
    );
  }

  /**
   * GET /api/v1/teams/:teamId/submission
   * Gets current team's submission.
   */
  @Get('teams/:teamId/submission')
  public async getTeamSubmission(
    @CurrentUser() user: { id: string },
    @Param('teamId') teamId: string
  ) {
    return this.submissionsService.getTeamSubmission(teamId, user.id);
  }

  /**
   * GET /api/v1/submissions/:submissionId
   * Gets details for a specific submission.
   */
  @Get('submissions/:submissionId')
  public async getSubmission(
    @CurrentUser() user: { id: string },
    @Param('submissionId') submissionId: string
  ) {
    return this.submissionsService.getSubmission(submissionId, user.id);
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/submissions
   * Gets all submissions for a hackathon. Organizer only.
   */
  @Get('hackathons/:hackathonId/submissions')
  public async getHackathonSubmissions(
    @CurrentUser() user: { id: string },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.submissionsService.getHackathonSubmissions(hackathonId, user.id);
  }

  /**
   * POST /api/v1/submissions/:submissionId/finalize
   * Finalizes submission and captures GitHub commit SHA snapshot.
   */
  @Post('submissions/:submissionId/finalize')
  public async finalizeSubmission(
    @CurrentUser() user: { id: string; email: string },
    @Param('submissionId') submissionId: string
  ) {
    return this.submissionsService.finalizeSubmission(submissionId, user.id, user.email);
  }

  /**
   * POST /api/v1/submissions/:submissionId/withdraw
   * Withdraws a submission.
   */
  @Post('submissions/:submissionId/withdraw')
  public async withdrawSubmission(
    @CurrentUser() user: { id: string; email: string },
    @Param('submissionId') submissionId: string
  ) {
    return this.submissionsService.withdrawSubmission(submissionId, user.id, user.email);
  }
}
