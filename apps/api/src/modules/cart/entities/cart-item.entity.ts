import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { CartEntity } from './cart.entity';

@Entity('cart_items')
export class CartItemEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'cart_id' }) cartId: string;

  @ManyToOne(() => CartEntity, (c) => c.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @Column({ name: 'product_id' }) productId: string;
  @Column({ name: 'variant_id', nullable: true }) variantId?: string;
  @Column({ length: 500 }) name: string;
  @Column({ nullable: true }) sku?: string;
  @Column({ default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 }) unitPrice: number;
  @Column({ nullable: true }) image?: string;
}
