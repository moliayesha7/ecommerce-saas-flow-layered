import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_images')
export class ProductImageEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'product_id' }) productId: string;

  @ManyToOne(() => ProductEntity, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column() url: string;
  @Column({ nullable: true }) alt?: string;
  @Column({ default: 0 }) position: number;
  @Column({ name: 'is_default', default: false }) isDefault: boolean;
}
