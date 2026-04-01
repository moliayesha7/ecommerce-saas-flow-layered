import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@saas-commerce/types';

@ApiTags('Customer - Cart')
@ApiBearerAuth()
@Controller('customer/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart' })
  getCart(@CurrentUser() user: AuthUser, @Query('tenantId') tenantId: string) {
    return this.cartService.getCart(tenantId, user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(
    @CurrentUser() user: AuthUser,
    @Query('tenantId') tenantId: string,
    @Body() body: { productId: string; variantId?: string; quantity: number },
  ) {
    return this.cartService.addItem(tenantId, body, user.id);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItem(itemId, quantity);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.cartService.removeItem(itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  clear(@CurrentUser() user: AuthUser, @Query('tenantId') tenantId: string) {
    return this.cartService.clear(tenantId, user.id);
  }
}
