import { PaymentProvider, PaymentStatus } from '../enums';

export interface IPayment {
  id: string;
  tenantId: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  transactionId?: string;
  providerResponse?: Record<string, unknown>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
