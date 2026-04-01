import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, AuthUser } from '@saas-commerce/types';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Admin dashboard stats' })
  get() {
    return this.dashboardService.getAdminDashboard();
  }
}

@ApiTags('Subscriber - Analytics')
@ApiBearerAuth()
@Controller('subscriber/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TENANT_OWNER, UserRole.TENANT_STAFF)
export class SubscriberDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Subscriber dashboard stats' })
  get(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getSubscriberDashboard(user.tenantId!);
  }

  @Get('sales-trend')
  @ApiOperation({ summary: 'Sales trend chart data' })
  salesTrend(@CurrentUser() user: AuthUser, @Query('days') days = 30) {
    return this.dashboardService.getSalesTrend(user.tenantId!, days);
  }
}
