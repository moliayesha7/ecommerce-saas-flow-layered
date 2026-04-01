import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { ProductStatus } from '@saas-commerce/types';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { ProductImageEntity } from './product-image.entity';
import { ProductVariantEntity } from './product-variant.entity';

@Entity('products')
@Index(['tenantId', 'slug'])
@Index(['tenantId', 'status'])
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'category_id', nullable: true }) categoryId?: string;

  @ManyToOne(() => CategoryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity;

  @Column({ length: 500 }) name: string;
  @Column({ length: 500 }) slug: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ name: 'short_description', length: 1000, nullable: true }) shortDescription?: string;

  @Column({ length: 100 }) sku: string;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) price: number;
  @Column({ name: 'compare_at_price', type: 'decimal', precision: 12, scale: 2, nullable: true }) compareAtPrice?: number;
  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, nullable: true }) costPrice?: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT }) status: ProductStatus;
  @Column({ name: 'track_inventory', default: true }) trackInventory: boolean;
  @Column({ name: 'allow_backorder', default: false }) allowBackorder: boolean;
  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true }) weight?: number;

  @Column({ type: 'simple-array', nullable: true }) tags?: string[];
  @Column({ name: 'meta_title', length: 255, nullable: true }) metaTitle?: string;
  @Column({ name: 'meta_description', length: 500, nullable: true }) metaDescription?: string;

  @OneToMany(() => ProductImageEntity, (img) => img.product, { cascade: true, eager: false })
  images?: ProductImageEntity[];

  @OneToMany(() => ProductVariantEntity, (v) => v.product, { cascade: true, eager: false })
  variants?: ProductVariantEntity[];

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
