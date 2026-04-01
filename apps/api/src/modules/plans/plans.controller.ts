import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@saas-commerce/types';

@ApiTags('Admin - Plans')
@ApiBearerAuth()
@Controller('admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List subscription plans' })
  findAll(@Query('includeInactive') includeInactive?: boolean) {
    return this.plansService.findAll(includeInactive);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get plan by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.findById(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a subscription plan' })
  create(@Body() body: Record<string, unknown>) {
    return this.plansService.create(body as never);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a subscription plan' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: Record<string, unknown>) {
    return this.plansService.update(id, body as never);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a subscription plan' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.delete(id);
  }
}
