import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';
import { NotificationType } from '@saas-commerce/types';

@Entity('notifications')
@Index(['userId'])
@Index(['tenantId'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ name: 'tenant_id', nullable: true }) tenantId?: string;
  @Column({ type: 'enum', enum: NotificationType }) type: NotificationType;
  @Column({ length: 500 }) title: string;
  @Column({ type: 'text' }) message: string;
  @Column({ type: 'jsonb', nullable: true }) data?: Record<string, unknown>;
  @Column({ name: 'is_read', default: false }) isRead: boolean;
  @Column({ name: 'read_at', nullable: true }) readAt?: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
