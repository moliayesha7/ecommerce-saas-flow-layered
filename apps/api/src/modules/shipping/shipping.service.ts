import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShipmentEntity } from './entities/shipment.entity';
import { ShippingRateEntity } from './entities/shipping-rate.entity';
import { ShipmentStatus } from '@saas-commerce/types';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShipmentEntity)
    private shipmentRepository: Repository<ShipmentEntity>,
    @InjectRepository(ShippingRateEntity)
    private rateRepository: Repository<ShippingRateEntity>,
  ) {}

  async getRates(tenantId: string) {
    return this.rateRepository.find({
      where: { tenantId, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async getAllRates(tenantId: string) {
    return this.rateRepository.find({ where: { tenantId }, order: { sortOrder: 'ASC' } });
  }

  async createRate(tenantId: string, data: Partial<ShippingRateEntity>) {
    const rate = this.rateRepository.create({ ...data, tenantId });
    return this.rateRepository.save(rate);
  }

  async updateRate(id: string, data: Partial<ShippingRateEntity>) {
    await this.rateRepository.update(id, data);
    return this.rateRepository.findOneByOrFail({ id });
  }

  async deleteRate(id: string) {
    await this.rateRepository.delete(id);
  }

  async createShipment(tenantId: string, orderId: string, data: Partial<ShipmentEntity>) {
    const shipment = this.shipmentRepository.create({ ...data, tenantId, orderId });
    return this.shipmentRepository.save(shipment);
  }

  async findByOrder(orderId: string) {
    return this.shipmentRepository.find({ where: { orderId }, order: { createdAt: 'DESC' } });
  }

  async updateTracking(id: string, data: { trackingNumber?: string; carrier?: string; trackingUrl?: string; status?: ShipmentStatus }) {
    await this.shipmentRepository.update(id, data);
    return this.shipmentRepository.findOneByOrFail({ id });
  }
}
