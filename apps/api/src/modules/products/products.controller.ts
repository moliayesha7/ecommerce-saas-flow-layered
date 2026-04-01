import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserRole, AuthUser } from '@saas-commerce/types';

// ─── Subscriber product management ───────────────────────────────────────────
@ApiTags('Subscriber - Products')
@ApiBearerAuth()
@Controller('subscriber/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TENANT_OWNER, UserRole.TENANT_STAFF)
export class SubscriberProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List own products' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto, @Query('categoryId') categoryId?: string) {
    return this.productsService.findAll(user.tenantId!, query, { categoryId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  create(@CurrentUser() user: AuthUser, @Body() body: Record<string, unknown>) {
    return this.productsService.create(user.tenantId!, body as never);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: Record<string, unknown>) {
    return this.productsService.update(id, body as never);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_OWNER)
  @ApiOperation({ summary: 'Delete product' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.delete(id);
  }

  @Post(':id/variants')
  @ApiOperation({ summary: 'Add variant to product' })
  addVariant(@Param('id', ParseUUIDPipe) id: string, @Body() body: Record<string, unknown>) {
    return this.productsService.addVariant(id, body as never);
  }

  @Patch(':id/variants/:variantId')
  @ApiOperation({ summary: 'Update product variant' })
  updateVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.productsService.updateVariant(variantId, body as never);
  }

  @Delete(':id/variants/:variantId')
  @ApiOperation({ summary: 'Delete product variant' })
  deleteVariant(@Param('variantId', ParseUUIDPipe) variantId: string) {
    return this.productsService.deleteVariant(variantId);
  }
}

// ─── Public customer catalog ──────────────────────────────────────────────────
@ApiTags('Customer - Catalog')
@Controller('customer/catalog')
@UseGuards(JwtAuthGuard)
export class CustomerCatalogController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':tenantSlug/products')
  @Public()
  @ApiOperation({ summary: 'Browse products in a store' })
  browseProducts(
    @Param('tenantSlug') tenantSlug: string,
    @Query() query: PaginationQueryDto,
    @Query('tenantId') tenantId: string,
  ) {
    return this.productsService.findPublic(tenantId, query);
  }

  @Get('products/:id')
  @Public()
  @ApiOperation({ summary: 'Get product detail' })
  getProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findById(id);
  }
}
