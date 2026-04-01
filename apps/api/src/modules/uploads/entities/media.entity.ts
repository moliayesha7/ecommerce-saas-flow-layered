import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';
import { MediaType } from '@saas-commerce/types';

@Entity('media')
@Index(['tenantId'])
export class MediaEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'tenant_id', nullable: true }) tenantId?: string;
  @Column({ name: 'uploaded_by' }) uploadedBy: string;
  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE }) type: MediaType;
  @Column() url: string;
  @Column({ name: 'original_name', nullable: true }) originalName?: string;
  @Column({ nullable: true }) mimeType?: string;
  @Column({ nullable: true }) size?: number;
  @Column({ nullable: true }) width?: number;
  @Column({ nullable: true }) height?: number;
  @Column({ nullable: true }) alt?: string;
  @Column({ nullable: true }) folder?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
