import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserRole } from '@saas-commerce/types';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['tenantId'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ nullable: true, length: 20 })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  tenantId?: string | null;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true, select: false })
  emailVerificationToken?: string;

  @Column({ name: 'password_reset_token', nullable: true, select: false })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expiry', nullable: true, select: false })
  passwordResetExpiry?: Date;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
