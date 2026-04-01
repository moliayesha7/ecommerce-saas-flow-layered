import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsController, SubscriberSettingsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { TenantEntity } from './entities/tenant.entity';
import { TenantSettingsEntity } from './entities/tenant-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, TenantSettingsEntity])],
  controllers: [TenantsController, SubscriberSettingsController],
  providers: [TenantsService],
  exports: [TenantsService, TypeOrmModule],
})
export class TenantsModule {}
