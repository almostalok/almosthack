import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JudgingService } from './judging.service';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { AssignJudgeDto } from './dto/assign-judge.dto';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import {
  createJudgingCriterionSchema,
  assignJudgeSchema,
  submitEvaluationSchema,
} from '@almosthack/validation';

@Controller({
  version: '1',
})
@UseGuards(SessionAuthGuard)
export class JudgingController {
  constructor(private readonly judgingService: JudgingService) {}

  /**
   * GET /api/v1/hackathons/:hackathonId/judging-criteria
   * Gets rubrics/criteria for a hackathon.
   */
  @Get('hackathons/:hackathonId/judging-criteria')
  public async getCriteria(@Param('hackathonId') hackathonId: string) {
    return this.judgingService.getCriteria(hackathonId);
  }

  /**
   * POST /api/v1/hackathons/:hackathonId/judging-criteria
   * Creates a new judging criterion. Organizer only.
   */
  @Post('hackathons/:hackathonId/judging-criteria')
  public async createCriterion(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string,
    @Body() dto: CreateCriterionDto
  ) {
    const parseResult = createJudgingCriterionSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_CRITERION_PAYLOAD',
        message: 'Invalid criterion payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.judgingService.createCriterion(
      hackathonId,
      user.id,
      user.email,
      parseResult.data as CreateCriterionDto
    );
  }

  /**
   * DELETE /api/v1/hackathons/:hackathonId/judging-criteria/:criterionId
   * Deletes a judging criterion. Organizer only.
   */
  @Delete('hackathons/:hackathonId/judging-criteria/:criterionId')
  public async deleteCriterion(
    @CurrentUser() user: { id: string; email: string },
    @Param('hackathonId') hackathonId: string,
    @Param('criterionId') criterionId: string
  ) {
    return this.judgingService.deleteCriterion(hackathonId, criterionId, user.id, user.email);
  }

  /**
   * POST /api/v1/submissions/:submissionId/judges
   * Assigns a judge to evaluate a submission. Organizer only. COI guarded.
   */
  @Post('submissions/:submissionId/judges')
  public async assignJudge(
    @CurrentUser() user: { id: string; email: string },
    @Param('submissionId') submissionId: string,
    @Body() dto: AssignJudgeDto
  ) {
    const parseResult = assignJudgeSchema.safeParse({ ...dto, submissionId });
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_ASSIGNMENT_PAYLOAD',
        message: 'Invalid judge assignment payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.judgingService.assignJudge(
      submissionId,
      user.id,
      user.email,
      parseResult.data as AssignJudgeDto
    );
  }

  /**
   * DELETE /api/v1/submissions/:submissionId/judges/:judgeUserId
   * Revokes a judge assignment. Organizer only.
   */
  @Delete('submissions/:submissionId/judges/:judgeUserId')
  public async revokeJudgeAssignment(
    @CurrentUser() user: { id: string; email: string },
    @Param('submissionId') submissionId: string,
    @Param('judgeUserId') judgeUserId: string
  ) {
    return this.judgingService.revokeJudgeAssignment(submissionId, judgeUserId, user.id, user.email);
  }

  /**
   * GET /api/v1/judge-assignments
   * Gets assigned submissions for current authenticated judge.
   */
  @Get('judge-assignments')
  public async getJudgeAssignments(@CurrentUser() user: { id: string }) {
    return this.judgingService.getJudgeAssignments(user.id);
  }

  /**
   * GET /api/v1/judge-assignments/:assignmentId
   * Gets assignment detail for a judge.
   */
  @Get('judge-assignments/:assignmentId')
  public async getJudgeAssignmentDetail(
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string
  ) {
    return this.judgingService.getJudgeAssignmentDetail(assignmentId, user.id);
  }

  /**
   * POST /api/v1/judge-assignments/:assignmentId/evaluation
   * Saves evaluation draft for an assignment. Judge only.
   */
  @Post('judge-assignments/:assignmentId/evaluation')
  public async saveEvaluationDraft(
    @CurrentUser() user: { id: string; email: string },
    @Param('assignmentId') assignmentId: string,
    @Body() dto: SubmitEvaluationDto
  ) {
    const parseResult = submitEvaluationSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_EVALUATION_PAYLOAD',
        message: 'Invalid evaluation payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.judgingService.saveEvaluationDraft(
      assignmentId,
      user.id,
      user.email,
      parseResult.data as SubmitEvaluationDto
    );
  }

  /**
   * POST /api/v1/judge-assignments/:assignmentId/evaluation/submit
   * Submits final evaluation for an assignment. Judge only. Immutable.
   */
  @Post('judge-assignments/:assignmentId/evaluation/submit')
  public async submitEvaluation(
    @CurrentUser() user: { id: string; email: string },
    @Param('assignmentId') assignmentId: string,
    @Body() dto: SubmitEvaluationDto
  ) {
    const parseResult = submitEvaluationSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'INVALID_EVALUATION_PAYLOAD',
        message: 'Invalid evaluation payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.judgingService.submitEvaluation(
      assignmentId,
      user.id,
      user.email,
      parseResult.data as SubmitEvaluationDto
    );
  }
}
