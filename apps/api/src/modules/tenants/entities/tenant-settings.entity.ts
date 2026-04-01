import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantEntity } from './tenant.entity';

@Entity('tenant_settings')
export class TenantSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', unique: true })
  tenantId: string;

  @OneToOne(() => TenantEntity, (tenant) => tenant.settings)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @Column({ default: 'BDT', length: 10 })
  currency: string;

  @Column({ default: 'Asia/Dhaka', length: 50 })
  timezone: string;

  @Column({ default: 'en', length: 10 })
  language: string;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ name: 'low_stock_threshold', default: 5 })
  lowStockThreshold: number;

  @Column({ name: 'order_prefix', default: 'ORD', length: 20 })
  orderPrefix: string;

  @Column({ name: 'enable_reviews', default: true })
  enableReviews: boolean;

  @Column({ name: 'enable_wishlist', default: true })
  enableWishlist: boolean;

  @Column({ name: 'enable_coupons', default: true })
  enableCoupons: boolean;

  @Column({ name: 'maintenance_mode', default: false })
  maintenanceMode: boolean;

  @Column({ name: 'meta_title', nullable: true, length: 255 })
  metaTitle?: string;

  @Column({ name: 'meta_description', nullable: true, length: 500 })
  metaDescription?: string;

  @Column({ name: 'social_links', type: 'jsonb', nullable: true })
  socialLinks?: Record<string, string>;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
