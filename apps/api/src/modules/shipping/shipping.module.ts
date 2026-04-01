import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingService } from './shipping.service';
import { ShipmentEntity } from './entities/shipment.entity';
import { ShippingRateEntity } from './entities/shipping-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShipmentEntity, ShippingRateEntity])],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
