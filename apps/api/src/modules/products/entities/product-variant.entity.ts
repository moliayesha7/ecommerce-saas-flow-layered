import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_variants')
export class ProductVariantEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'product_id' }) productId: string;

  @ManyToOne(() => ProductEntity, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ length: 255 }) name: string;
  @Column({ length: 100 }) sku: string;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) price: number;
  @Column({ name: 'compare_at_price', type: 'decimal', precision: 12, scale: 2, nullable: true }) compareAtPrice?: number;
  @Column({ type: 'jsonb', default: {} }) attributes: Record<string, string>;
  @Column({ default: 0 }) stock: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'image_url', nullable: true }) imageUrl?: string;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
