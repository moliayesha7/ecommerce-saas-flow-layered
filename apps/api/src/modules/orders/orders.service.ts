import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { paginate } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { OrderStatus } from '@saas-commerce/types';
import { generateOrderNumber } from '@saas-commerce/utils';

export interface CreateOrderData {
  tenantId: string;
  customerId: string;
  items: { productId: string; variantId?: string; name: string; sku: string; quantity: number; unitPrice: number; image?: string; attributes?: Record<string, string> }[];
  shippingAddress: Record<string, string>;
  billingAddress: Record<string, string>;
  shippingMethodId?: string;
  couponCode?: string;
  discountAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  currency?: string;
  notes?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private itemRepository: Repository<OrderItemEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string, query: PaginationQueryDto, filters?: { status?: OrderStatus; customerId?: string }) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .where('order.tenantId = :tenantId', { tenantId });

    if (filters?.status) qb.andWhere('order.status = :status', { status: filters.status });
    if (filters?.customerId) qb.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
    if (query.search) {
      qb.andWhere('order.orderNumber ILIKE :search', { search: `%${query.search}%` });
    }

    qb.orderBy('order.createdAt', 'DESC');
    return paginate(qb, query.page || 1, query.limit || 20);
  }

  async findAllAdmin(query: PaginationQueryDto) {
    const qb = this.orderRepository.createQueryBuilder('order').orderBy('order.createdAt', 'DESC');
    return paginate(qb, query.page || 1, query.limit || 20);
  }

  async findById(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({ where: { id }, relations: ['items'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByNumber(orderNumber: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({ where: { orderNumber }, relations: ['items'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(data: CreateOrderData): Promise<OrderEntity> {
    const subtotal = data.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const discountAmount = data.discountAmount || 0;
    const shippingAmount = data.shippingAmount || 0;
    const taxAmount = data.taxAmount || 0;
    const total = subtotal - discountAmount + shippingAmount + taxAmount;

    const order = this.orderRepository.create({
      tenantId: data.tenantId,
      customerId: data.customerId,
      orderNumber: generateOrderNumber('ORD'),
      status: OrderStatus.PENDING,
      subtotal,
      discountAmount,
      shippingAmount,
      taxAmount,
      total,
      currency: data.currency || 'BDT',
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      shippingMethodId: data.shippingMethodId,
      couponCode: data.couponCode,
      notes: data.notes,
    });

    const saved = await this.orderRepository.save(order);

    const items = data.items.map((i) =>
      this.itemRepository.create({
        orderId: saved.id,
        ...i,
        total: i.unitPrice * i.quantity,
      }),
    );
    await this.itemRepository.save(items);

    this.eventEmitter.emit('order.created', saved);
    return this.findById(saved.id);
  }

  async updateStatus(id: string, status: OrderStatus, notes?: string): Promise<OrderEntity> {
    const order = await this.findById(id);
    const prev = order.status;
    order.status = status;

    if (status === OrderStatus.CONFIRMED) order.confirmedAt = new Date();
    if (status === OrderStatus.SHIPPED) order.shippedAt = new Date();
    if (status === OrderStatus.DELIVERED) order.deliveredAt = new Date();
    if (status === OrderStatus.CANCELLED) {
      order.cancelledAt = new Date();
      order.cancelReason = notes;
    }

    const saved = await this.orderRepository.save(order);
    this.eventEmitter.emit('order.status_changed', { order: saved, previousStatus: prev });
    return saved;
  }

  async cancel(id: string, customerId: string, reason?: string): Promise<OrderEntity> {
    const order = await this.findById(id);
    if (order.customerId !== customerId) throw new ForbiddenException('Not authorized');
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new ForbiddenException('Order cannot be cancelled at this stage');
    }
    return this.updateStatus(id, OrderStatus.CANCELLED, reason);
  }

  async getStats(tenantId: string) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        'COUNT(*) as total',
        'SUM(CASE WHEN order.status = :pending THEN 1 ELSE 0 END) as pending',
        'SUM(CASE WHEN order.status = :delivered THEN 1 ELSE 0 END) as delivered',
        'SUM(order.total) as revenue',
      ])
      .where('order.tenantId = :tenantId', { tenantId })
      .setParameter('pending', OrderStatus.PENDING)
      .setParameter('delivered', OrderStatus.DELIVERED)
      .getRawOne();
    return result;
  }
}
