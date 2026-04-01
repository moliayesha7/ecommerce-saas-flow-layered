import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@saas-commerce/types';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Not authenticated');

    // Super admins bypass tenant checks
    if (user.role === UserRole.SUPER_ADMIN) return true;

    // Tenant-scoped users must have a tenantId
    if (!user.tenantId) {
      throw new ForbiddenException('No tenant context found');
    }

    // Inject tenantId into request for downstream services
    request.tenantId = user.tenantId;

    return true;
  }
}
