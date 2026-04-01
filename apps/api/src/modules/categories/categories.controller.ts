import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, AuthUser } from '@saas-commerce/types';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Public: customer browsing
  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Browse categories (public)' })
  findPublic(@Query('tenantId') tenantId: string) {
    return this.categoriesService.findAll(tenantId, null);
  }

  // Subscriber: manage own categories
  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.TENANT_OWNER, UserRole.TENANT_STAFF, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List categories' })
  findAll(@CurrentUser() user: AuthUser) {
    const tenantId = user.role === UserRole.SUPER_ADMIN ? null : user.tenantId!;
    return this.categoriesService.findAll(tenantId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get category by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.TENANT_OWNER, UserRole.TENANT_STAFF, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create category' })
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: AuthUser) {
    const tenantId = user.role === UserRole.SUPER_ADMIN ? null : user.tenantId;
    return this.categoriesService.create({ ...body, tenantId } as never);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.TENANT_OWNER, UserRole.TENANT_STAFF, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update category' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: Record<string, unknown>) {
    return this.categoriesService.update(id, body as never);
  }

  @Post('reorder')
  @ApiBearerAuth()
  @Roles(UserRole.TENANT_OWNER, UserRole.TENANT_STAFF)
  @ApiOperation({ summary: 'Reorder categories' })
  reorder(@Body() items: { id: string; sortOrder: number }[]) {
    return this.categoriesService.reorder(items);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.TENANT_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete category' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.delete(id);
  }
}
