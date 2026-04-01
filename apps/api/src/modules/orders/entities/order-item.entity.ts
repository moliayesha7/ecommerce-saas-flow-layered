import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'order_id' }) orderId: string;

  @ManyToOne(() => OrderEntity, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ name: 'product_id' }) productId: string;
  @Column({ name: 'variant_id', nullable: true }) variantId?: string;
  @Column({ length: 500 }) name: string;
  @Column({ length: 100 }) sku: string;
  @Column() quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 }) unitPrice: number;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) total: number;
  @Column({ nullable: true }) image?: string;
  @Column({ type: 'jsonb', nullable: true }) attributes?: Record<string, string>;
}
