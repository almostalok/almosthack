import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '@almosthack/types';

@ApiTags('Audit & Verifiable Ledger')
@ApiCookieAuth('almosthack_session')
@Controller('audit-logs')
@UseGuards(SessionAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions(Permission.AUDIT_READ)
  @ApiOperation({ summary: 'Query immutable audit logs with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Audit log entries matching query filters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAuditLogs(@Query() query: QueryAuditLogsDto) {
    return this.auditService.queryAuditLogs(query);
  }
}
