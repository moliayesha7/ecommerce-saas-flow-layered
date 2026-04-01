import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, Index,
} from 'typeorm';
import { OrderStatus } from '@saas-commerce/types';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'status'])
@Index(['orderNumber'], { unique: true })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'customer_id' }) customerId: string;
  @Column({ name: 'order_number', unique: true }) orderNumber: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING }) status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 }) subtotal: number;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }) discountAmount: number;
  @Column({ name: 'shipping_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }) shippingAmount: number;
  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }) taxAmount: number;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) total: number;
  @Column({ default: 'BDT' }) currency: string;

  @Column({ type: 'jsonb' }) shippingAddress: Record<string, string>;
  @Column({ type: 'jsonb' }) billingAddress: Record<string, string>;

  @Column({ name: 'shipping_method_id', nullable: true }) shippingMethodId?: string;
  @Column({ name: 'coupon_code', nullable: true }) couponCode?: string;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @Column({ name: 'internal_notes', type: 'text', nullable: true }) internalNotes?: string;

  @Column({ name: 'confirmed_at', nullable: true }) confirmedAt?: Date;
  @Column({ name: 'shipped_at', nullable: true }) shippedAt?: Date;
  @Column({ name: 'delivered_at', nullable: true }) deliveredAt?: Date;
  @Column({ name: 'cancelled_at', nullable: true }) cancelledAt?: Date;
  @Column({ name: 'cancel_reason', nullable: true }) cancelReason?: string;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true, eager: true })
  items: OrderItemEntity[];

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
