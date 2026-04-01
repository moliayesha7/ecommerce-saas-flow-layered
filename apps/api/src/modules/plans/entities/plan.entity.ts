import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('subscription_plans')
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 50 })
  slug: string;

  @Column({ nullable: true, length: 500 })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'BDT', length: 10 })
  currency: string;

  @Column({ default: 'monthly', length: 20 })
  interval: string; // 'monthly' | 'yearly'

  @Column({ name: 'interval_count', default: 1 })
  intervalCount: number;

  @Column({ name: 'trial_days', default: 0 })
  trialDays: number;

  @Column({ type: 'jsonb', nullable: true })
  features?: string[];

  @Column({ name: 'max_products', nullable: true })
  maxProducts?: number;

  @Column({ name: 'max_staff', nullable: true })
  maxStaff?: number;

  @Column({ name: 'max_orders_per_month', nullable: true })
  maxOrdersPerMonth?: number;

  @Column({ name: 'storage_gb', nullable: true })
  storageGb?: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_popular', default: false })
  isPopular: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
