import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { StockMovementType } from '@saas-commerce/types';
import { InventoryEntity } from './inventory.entity';

@Entity('inventory_movements')
export class InventoryMovementEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'inventory_id' }) inventoryId: string;

  @ManyToOne(() => InventoryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_id' })
  inventory: InventoryEntity;

  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ type: 'enum', enum: StockMovementType }) type: StockMovementType;
  @Column() quantity: number;
  @Column({ name: 'previous_quantity' }) previousQuantity: number;
  @Column({ name: 'new_quantity' }) newQuantity: number;
  @Column({ nullable: true }) reason?: string;
  @Column({ name: 'reference_id', nullable: true }) referenceId?: string;
  @Column({ name: 'reference_type', nullable: true }) referenceType?: string;
  @Column({ name: 'created_by', nullable: true }) createdBy?: string;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
