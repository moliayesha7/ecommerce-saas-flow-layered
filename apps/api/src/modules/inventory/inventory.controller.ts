import { Controller, Get, Post, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserRole, AuthUser, StockMovementType } from '@saas-commerce/types';

@ApiTags('Subscriber - Inventory')
@ApiBearerAuth()
@Controller('subscriber/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TENANT_OWNER, UserRole.TENANT_STAFF)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return this.inventoryService.findAll(user.tenantId!, query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low-stock products' })
  getLowStock(@CurrentUser() user: AuthUser) {
    return this.inventoryService.getLowStock(user.tenantId!);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get inventory for a product' })
  findByProduct(@CurrentUser() user: AuthUser, @Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.findByProduct(user.tenantId!, productId);
  }

  @Post(':productId/adjust')
  @ApiOperation({ summary: 'Adjust stock level' })
  adjust(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: { quantity: number; type: StockMovementType; reason?: string },
  ) {
    return this.inventoryService.adjustStock(user.tenantId!, productId, body.quantity, body.type, {
      reason: body.reason,
      createdBy: user.id,
    });
  }

  @Get(':productId/movements')
  @ApiOperation({ summary: 'Get stock movement history' })
  movements(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.inventoryService.getMovements(user.tenantId!, productId, query);
  }
}
