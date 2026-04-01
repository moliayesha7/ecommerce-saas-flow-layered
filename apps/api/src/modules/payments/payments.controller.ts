import { Controller, Get, Post, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserRole, AuthUser } from '@saas-commerce/types';

@ApiTags('Admin - Payments')
@ApiBearerAuth()
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all payments' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.paymentsService.findAllAdmin(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Global payment stats' })
  stats() {
    return this.paymentsService.getStats();
  }
}

@ApiTags('Customer - Payments')
@ApiBearerAuth()
@Controller('customer/payments')
@UseGuards(JwtAuthGuard)
export class CustomerPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('bkash/initiate')
  @ApiOperation({ summary: 'Initiate bKash payment' })
  initiateBkash(
    @CurrentUser() user: AuthUser,
    @Body() body: { orderId: string; tenantId: string },
  ) {
    return this.paymentsService.initiateBkashPayment(body.tenantId, body.orderId, user.id);
  }

  @Get('bkash/callback')
  @Public()
  @ApiOperation({ summary: 'bKash payment callback' })
  bkashCallback(@Query('paymentID') paymentID: string) {
    return this.paymentsService.executeBkashPayment(paymentID);
  }

  @Post('cod')
  @ApiOperation({ summary: 'Create COD payment record' })
  createCOD(@CurrentUser() user: AuthUser, @Body() body: { orderId: string; tenantId: string }) {
    return this.paymentsService.createCODPayment(body.tenantId, body.orderId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payments for an order' })
  byOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }
}
