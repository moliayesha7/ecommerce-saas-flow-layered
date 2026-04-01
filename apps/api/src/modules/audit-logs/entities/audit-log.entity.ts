import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['tenantId'])
@Index(['userId'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'tenant_id', nullable: true }) tenantId?: string;
  @Column({ name: 'user_id', nullable: true }) userId?: string;
  @Column() action: string;
  @Column({ name: 'resource_type' }) resourceType: string;
  @Column({ name: 'resource_id', nullable: true }) resourceId?: string;
  @Column({ type: 'jsonb', nullable: true }) changes?: Record<string, unknown>;
  @Column({ name: 'ip_address', nullable: true }) ipAddress?: string;
  @Column({ name: 'user_agent', nullable: true }) userAgent?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
