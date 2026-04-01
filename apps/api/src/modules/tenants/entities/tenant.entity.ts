import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { TenantStatus } from '@saas-commerce/types';
import { TenantSettingsEntity } from './tenant-settings.entity';

@Entity('tenants')
@Index(['slug'], { unique: true })
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ nullable: true, unique: true, length: 255 })
  domain?: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.PENDING,
  })
  status: TenantStatus;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 20 })
  phone?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true, length: 500 })
  description?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'suspended_at', nullable: true })
  suspendedAt?: Date;

  @Column({ name: 'suspension_reason', nullable: true })
  suspensionReason?: string;

  @OneToOne(() => TenantSettingsEntity, (settings) => settings.tenant, {
    cascade: true,
    eager: false,
  })
  settings?: TenantSettingsEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
