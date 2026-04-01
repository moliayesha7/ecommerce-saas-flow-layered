import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CartItemEntity } from './cart-item.entity';

@Entity('carts')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'customer_id', nullable: true }) customerId?: string;
  @Column({ name: 'session_id', nullable: true }) sessionId?: string;

  @Column({ name: 'coupon_code', nullable: true }) couponCode?: string;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }) discountAmount: number;
  @Column({ default: 'BDT' }) currency: string;

  @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true, eager: true })
  items: CartItemEntity[];

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
