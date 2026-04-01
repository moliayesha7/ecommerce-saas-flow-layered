import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriberProductsController, CustomerCatalogController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductEntity } from './entities/product.entity';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductImageEntity } from './entities/product-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductVariantEntity, ProductImageEntity])],
  controllers: [SubscriberProductsController, CustomerCatalogController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
