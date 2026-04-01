import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { DiscountType } from '@saas-commerce/types';

@Entity('coupons')
@Index(['tenantId', 'code'], { unique: true })
export class CouponEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ length: 100 }) code: string;
  @Column({ length: 255 }) description: string;
  @Column({ type: 'enum', enum: DiscountType }) type: DiscountType;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) value: number;
  @Column({ name: 'min_order_amount', type: 'decimal', precision: 10, scale: 2, default: 0 }) minOrderAmount: number;
  @Column({ name: 'max_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true }) maxDiscountAmount?: number;
  @Column({ name: 'usage_limit', nullable: true }) usageLimit?: number;
  @Column({ name: 'usage_count', default: 0 }) usageCount: number;
  @Column({ name: 'per_user_limit', default: 1 }) perUserLimit: number;
  @Column({ name: 'starts_at', nullable: true }) startsAt?: Date;
  @Column({ name: 'expires_at', nullable: true }) expiresAt?: Date;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
