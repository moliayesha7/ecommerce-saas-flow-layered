import { Controller, Get, Post, Delete, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, AuthUser } from '@saas-commerce/types';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all subscriptions (admin)' })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('me')
  @Roles(UserRole.TENANT_OWNER)
  @ApiOperation({ summary: 'Get own subscription' })
  getMySubscription(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.findByTenant(user.tenantId!);
  }

  @Post('subscribe')
  @Roles(UserRole.TENANT_OWNER)
  @ApiOperation({ summary: 'Subscribe to a plan' })
  subscribe(@CurrentUser() user: AuthUser, @Body('planId') planId: string) {
    return this.subscriptionsService.create(user.tenantId!, planId);
  }

  @Delete('cancel')
  @Roles(UserRole.TENANT_OWNER)
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@CurrentUser() user: AuthUser, @Body('reason') reason?: string) {
    return this.subscriptionsService.cancel(user.tenantId!, reason);
  }
}
