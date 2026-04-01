import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { PaymentProvider, PaymentStatus } from '@saas-commerce/types';

@Entity('payments')
@Index(['tenantId', 'orderId'])
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'order_id' }) orderId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 }) amount: number;
  @Column({ default: 'BDT' }) currency: string;

  @Column({ type: 'enum', enum: PaymentProvider }) provider: PaymentProvider;
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING }) status: PaymentStatus;

  @Column({ name: 'transaction_id', nullable: true }) transactionId?: string;
  @Column({ name: 'gateway_transaction_id', nullable: true }) gatewayTransactionId?: string;
  @Column({ name: 'provider_response', type: 'jsonb', nullable: true }) providerResponse?: Record<string, unknown>;

  @Column({ name: 'paid_at', nullable: true }) paidAt?: Date;
  @Column({ name: 'failed_at', nullable: true }) failedAt?: Date;
  @Column({ name: 'failure_reason', nullable: true }) failureReason?: string;

  @Column({ name: 'refunded_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }) refundedAmount: number;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
