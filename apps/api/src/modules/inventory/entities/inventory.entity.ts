import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity('inventory')
@Index(['tenantId', 'productId', 'variantId'], { unique: true })
export class InventoryEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'product_id' }) productId: string;
  @Column({ name: 'variant_id', nullable: true }) variantId?: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ default: 0 }) quantity: number;
  @Column({ name: 'reserved_quantity', default: 0 }) reservedQuantity: number;
  @Column({ name: 'low_stock_threshold', default: 5 }) lowStockThreshold: number;
  @Column({ nullable: true }) location?: string;
  @Column({ nullable: true }) warehouse?: string;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
