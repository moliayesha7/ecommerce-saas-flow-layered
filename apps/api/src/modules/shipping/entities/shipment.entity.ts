import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ShipmentStatus } from '@saas-commerce/types';

@Entity('shipments')
@Index(['tenantId', 'orderId'])
export class ShipmentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'order_id' }) orderId: string;
  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.PENDING }) status: ShipmentStatus;
  @Column({ name: 'tracking_number', nullable: true }) trackingNumber?: string;
  @Column({ name: 'carrier', nullable: true }) carrier?: string;
  @Column({ name: 'tracking_url', nullable: true }) trackingUrl?: string;
  @Column({ name: 'estimated_delivery', nullable: true }) estimatedDelivery?: Date;
  @Column({ nullable: true }) notes?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
