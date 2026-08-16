import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';

/**
 * RolesGuard delegates execution to the canonical PermissionsGuard for backward compatibility.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly permissionsGuard: PermissionsGuard) {}

  public canActivate(context: ExecutionContext): Promise<boolean> {
    return this.permissionsGuard.canActivate(context);
  }
}
