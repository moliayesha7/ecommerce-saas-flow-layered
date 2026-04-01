import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserRole, AuthUser } from '@saas-commerce/types';

@ApiTags('Admin - Tenants')
@ApiBearerAuth()
@Controller('admin/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tenants' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.tenantsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get tenant statistics' })
  stats() {
    return this.tenantsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tenant' })
  create(@Body() dto: CreateTenantDto, @CurrentUser() user: AuthUser) {
    return this.tenantsService.create(dto, user.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a pending tenant' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.approve(id);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend a tenant' })
  suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.tenantsService.suspend(id, reason);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reactivate a suspended tenant' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.activate(id);
  }

  @Get(':id/settings')
  @ApiOperation({ summary: 'Get tenant settings' })
  getSettings(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.getSettings(id);
  }
}

// Subscriber-facing tenant controller
@ApiTags('Subscriber - Settings')
@ApiBearerAuth()
@Controller('subscriber/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TENANT_OWNER, UserRole.TENANT_STAFF)
export class SubscriberSettingsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get own store settings' })
  getSettings(@CurrentUser() user: AuthUser) {
    return this.tenantsService.getSettings(user.tenantId!);
  }

  @Patch()
  @ApiOperation({ summary: 'Update own store settings' })
  updateSettings(
    @CurrentUser() user: AuthUser,
    @Body() updates: Record<string, unknown>,
  ) {
    return this.tenantsService.updateSettings(user.tenantId!, updates);
  }

  @Get('store')
  @ApiOperation({ summary: 'Get own store info' })
  getStore(@CurrentUser() user: AuthUser) {
    return this.tenantsService.findById(user.tenantId!);
  }

  @Patch('store')
  @ApiOperation({ summary: 'Update own store info' })
  updateStore(@CurrentUser() user: AuthUser, @Body() updates: Partial<CreateTenantDto>) {
    return this.tenantsService.update(user.tenantId!, updates);
  }
}
