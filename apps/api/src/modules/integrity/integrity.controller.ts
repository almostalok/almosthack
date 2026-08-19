import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IntegrityService } from './integrity.service';
import { StartAnalysisDto } from './dto/start-analysis.dto';
import { ReviewFindingDto } from './dto/review-finding.dto';
import { ConfirmFindingDto } from './dto/confirm-finding.dto';
import { DismissFindingDto } from './dto/dismiss-finding.dto';

@Controller({
  version: '1',
})
@UseGuards(SessionAuthGuard)
export class IntegrityController {
  constructor(private readonly integrityService: IntegrityService) {}

  @Post('submissions/:submissionId/integrity/analyze')
  @HttpCode(HttpStatus.OK)
  async startAnalysis(
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: any,
    @Body() dto: StartAnalysisDto
  ) {
    const data = await this.integrityService.startAnalysis(
      submissionId,
      user.id,
      user.email,
      dto
    );
    return {
      success: true,
      data,
    };
  }

  @Get('submissions/:submissionId/integrity')
  async getSubmissionAnalyses(
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: any
  ) {
    const data = await this.integrityService.getSubmissionAnalyses(
      submissionId,
      user.id
    );
    return {
      success: true,
      data,
    };
  }

  @Get('hackathons/:hackathonId/integrity/analyses')
  async getHackathonAnalyses(
    @Param('hackathonId') hackathonId: string,
    @CurrentUser() user: any
  ) {
    const data = await this.integrityService.getHackathonAnalyses(
      hackathonId,
      user.id
    );
    return {
      success: true,
      data,
    };
  }

  @Get('hackathons/:hackathonId/integrity/findings')
  async getHackathonFindings(
    @Param('hackathonId') hackathonId: string,
    @Query('status') status: string,
    @CurrentUser() user: any
  ) {
    const data = await this.integrityService.getHackathonFindings(
      hackathonId,
      user.id,
      status
    );
    return {
      success: true,
      data,
    };
  }

  @Get('integrity/findings/:findingId')
  async getFindingDetail(
    @Param('findingId') findingId: string,
    @CurrentUser() user: any
  ) {
    const data = await this.integrityService.getFindingDetail(
      findingId,
      user.id
    );
    return {
      success: true,
      data,
    };
  }

  @Post('integrity/findings/:findingId/review')
  @HttpCode(HttpStatus.OK)
  async startReview(
    @Param('findingId') findingId: string,
    @CurrentUser() user: any,
    @Body() dto: ReviewFindingDto
  ) {
    const data = await this.integrityService.startReview(
      findingId,
      user.id,
      user.email,
      dto
    );
    return {
      success: true,
      data,
    };
  }

  @Post('integrity/findings/:findingId/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmFinding(
    @Param('findingId') findingId: string,
    @CurrentUser() user: any,
    @Body() dto: ConfirmFindingDto
  ) {
    const data = await this.integrityService.confirmFinding(
      findingId,
      user.id,
      user.email,
      dto
    );
    return {
      success: true,
      data,
    };
  }

  @Post('integrity/findings/:findingId/dismiss')
  @HttpCode(HttpStatus.OK)
  async dismissFinding(
    @Param('findingId') findingId: string,
    @CurrentUser() user: any,
    @Body() dto: DismissFindingDto
  ) {
    const data = await this.integrityService.dismissFinding(
      findingId,
      user.id,
      user.email,
      dto
    );
    return {
      success: true,
      data,
    };
  }
}
