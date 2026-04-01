import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService, CreateOrderData } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserRole, AuthUser, OrderStatus } from '@saas-commerce/types';

// Subscriber order management
@ApiTags('Subscriber - Orders')
@ApiBearerAuth()
@Controller('subscriber/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TENANT_OWNER, UserRole.TENANT_STAFF)
export class SubscriberOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List store orders' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto, @Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(user.tenantId!, query, { status });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Order statistics' })
  stats(@CurrentUser() user: AuthUser) {
    return this.ordersService.getStats(user.tenantId!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: OrderStatus; notes?: string },
  ) {
    return this.ordersService.updateStatus(id, body.status, body.notes);
  }
}

// Customer order management
@ApiTags('Customer - Orders')
@ApiBearerAuth()
@Controller('customer/orders')
@UseGuards(JwtAuthGuard)
export class CustomerOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get my orders' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto, @Query('tenantId') tenantId: string) {
    return this.ordersService.findAll(tenantId, query, { customerId: user.id });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  create(@CurrentUser() user: AuthUser, @Body() body: Omit<CreateOrderData, 'customerId'>) {
    return this.ordersService.create({ ...body, customerId: user.id });
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser, @Body('reason') reason?: string) {
    return this.ordersService.cancel(id, user.id, reason);
  }
}
