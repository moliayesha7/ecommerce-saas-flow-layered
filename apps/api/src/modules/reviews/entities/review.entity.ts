import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('reviews')
@Index(['tenantId', 'productId'])
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'product_id' }) productId: string;
  @Column({ name: 'customer_id' }) customerId: string;
  @Column({ name: 'order_id', nullable: true }) orderId?: string;
  @Column() rating: number;
  @Column({ nullable: true, length: 255 }) title?: string;
  @Column({ type: 'text', nullable: true }) body?: string;
  @Column({ name: 'is_verified', default: false }) isVerified: boolean;
  @Column({ name: 'is_approved', default: false }) isApproved: boolean;
  @Column({ name: 'approved_at', nullable: true }) approvedAt?: Date;
  @Column({ type: 'simple-array', nullable: true }) images?: string[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
