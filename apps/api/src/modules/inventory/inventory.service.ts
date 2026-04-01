import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { InventoryEntity } from './entities/inventory.entity';
import { InventoryMovementEntity } from './entities/inventory-movement.entity';
import { StockMovementType } from '@saas-commerce/types';
import { paginate } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryEntity)
    private inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(InventoryMovementEntity)
    private movementRepository: Repository<InventoryMovementEntity>,
  ) {}

  async findAll(tenantId: string, query: PaginationQueryDto) {
    const qb = this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .where('inv.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${query.search}%` });
    }

    return paginate(qb, query.page || 1, query.limit || 20);
  }

  async findByProduct(tenantId: string, productId: string, variantId?: string) {
    return this.inventoryRepository.findOne({
      where: { tenantId, productId, variantId: variantId ?? undefined },
    });
  }

  async getOrCreate(tenantId: string, productId: string, variantId?: string) {
    let inv = await this.findByProduct(tenantId, productId, variantId);
    if (!inv) {
      inv = this.inventoryRepository.create({ tenantId, productId, variantId, quantity: 0 });
      await this.inventoryRepository.save(inv);
    }
    return inv;
  }

  async adjustStock(
    tenantId: string,
    productId: string,
    adjustment: number,
    type: StockMovementType,
    meta?: { reason?: string; referenceId?: string; referenceType?: string; createdBy?: string; variantId?: string },
  ) {
    const inv = await this.getOrCreate(tenantId, productId, meta?.variantId);

    if (type === StockMovementType.SALE && inv.quantity < adjustment) {
      throw new BadRequestException('Insufficient stock');
    }

    const previousQuantity = inv.quantity;
    const newQuantity =
      type === StockMovementType.SALE || type === StockMovementType.DAMAGE
        ? inv.quantity - Math.abs(adjustment)
        : inv.quantity + Math.abs(adjustment);

    inv.quantity = Math.max(0, newQuantity);
    await this.inventoryRepository.save(inv);

    const movement = this.movementRepository.create({
      inventoryId: inv.id,
      tenantId,
      type,
      quantity: adjustment,
      previousQuantity,
      newQuantity: inv.quantity,
      reason: meta?.reason,
      referenceId: meta?.referenceId,
      referenceType: meta?.referenceType,
      createdBy: meta?.createdBy,
    });
    await this.movementRepository.save(movement);

    return inv;
  }

  async reserveStock(tenantId: string, productId: string, quantity: number, variantId?: string) {
    const inv = await this.getOrCreate(tenantId, productId, variantId);
    const available = inv.quantity - inv.reservedQuantity;
    if (available < quantity) throw new BadRequestException('Insufficient available stock');
    inv.reservedQuantity += quantity;
    return this.inventoryRepository.save(inv);
  }

  async releaseReservation(tenantId: string, productId: string, quantity: number, variantId?: string) {
    const inv = await this.getOrCreate(tenantId, productId, variantId);
    inv.reservedQuantity = Math.max(0, inv.reservedQuantity - quantity);
    return this.inventoryRepository.save(inv);
  }

  async getLowStock(tenantId: string) {
    return this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .where('inv.tenantId = :tenantId', { tenantId })
      .andWhere('inv.quantity <= inv.lowStockThreshold')
      .getMany();
  }

  async getMovements(tenantId: string, productId: string, query: PaginationQueryDto) {
    const inv = await this.findByProduct(tenantId, productId);
    if (!inv) return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };

    const qb = this.movementRepository
      .createQueryBuilder('mov')
      .where('mov.inventoryId = :id', { id: inv.id })
      .orderBy('mov.createdAt', 'DESC');

    return paginate(qb, query.page || 1, query.limit || 20);
  }
}
