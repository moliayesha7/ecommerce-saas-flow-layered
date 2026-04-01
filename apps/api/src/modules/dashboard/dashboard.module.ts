import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDashboardController, SubscriberDashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { OrderEntity } from '../orders/entities/order.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, PaymentEntity, ProductEntity, TenantEntity, UserEntity])],
  controllers: [AdminDashboardController, SubscriberDashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
