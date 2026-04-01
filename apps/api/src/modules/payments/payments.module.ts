import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPaymentsController, CustomerPaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from './entities/payment.entity';
import { BkashProvider } from './providers/bkash.provider';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity]), OrdersModule],
  controllers: [AdminPaymentsController, CustomerPaymentsController],
  providers: [PaymentsService, BkashProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
