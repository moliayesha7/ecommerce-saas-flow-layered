import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('shipping_rates')
export class ShippingRateEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ length: 255 }) name: string;
  @Column({ length: 100 }) carrier: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) price: number;
  @Column({ name: 'min_order_amount', type: 'decimal', precision: 10, scale: 2, default: 0 }) minOrderAmount: number;
  @Column({ name: 'free_shipping_threshold', type: 'decimal', precision: 10, scale: 2, nullable: true }) freeShippingThreshold?: number;
  @Column({ name: 'estimated_days', nullable: true }) estimatedDays?: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
