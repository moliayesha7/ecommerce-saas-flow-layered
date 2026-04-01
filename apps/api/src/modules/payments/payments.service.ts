import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentEntity } from './entities/payment.entity';
import { BkashProvider } from './providers/bkash.provider';
import { OrdersService } from '../orders/orders.service';
import { PaymentProvider, PaymentStatus, OrderStatus } from '@saas-commerce/types';
import { paginate } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    private bkashProvider: BkashProvider,
    private ordersService: OrdersService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string, query: PaginationQueryDto) {
    const qb = this.paymentRepository
      .createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId })
      .orderBy('p.createdAt', 'DESC');
    return paginate(qb, query.page || 1, query.limit || 20);
  }

  async findAllAdmin(query: PaginationQueryDto) {
    const qb = this.paymentRepository.createQueryBuilder('p').orderBy('p.createdAt', 'DESC');
    return paginate(qb, query.page || 1, query.limit || 20);
  }

  async findByOrder(orderId: string) {
    return this.paymentRepository.find({ where: { orderId }, order: { createdAt: 'DESC' } });
  }

  async initiateBkashPayment(tenantId: string, orderId: string, customerId: string) {
    const order = await this.ordersService.findById(orderId);
    if (order.tenantId !== tenantId) throw new BadRequestException('Order not found');

    const callbackURL = `${this.configService.get('app.url')}/api/customer/payments/bkash/callback`;

    const bkashResponse = await this.bkashProvider.createPayment({
      amount: order.total,
      currency: order.currency,
      merchantInvoiceNumber: order.orderNumber,
      callbackURL,
    });

    const payment = this.paymentRepository.create({
      tenantId,
      orderId,
      amount: order.total,
      currency: order.currency,
      provider: PaymentProvider.BKASH,
      status: PaymentStatus.INITIATED,
      gatewayTransactionId: bkashResponse.paymentID,
      providerResponse: bkashResponse,
    });

    await this.paymentRepository.save(payment);
    return { payment, bkashURL: bkashResponse.bkashURL };
  }

  async executeBkashPayment(paymentID: string) {
    const payment = await this.paymentRepository.findOne({
      where: { gatewayTransactionId: paymentID },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const result = await this.bkashProvider.executePayment(paymentID);

    if (result.statusCode === '0000') {
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionId = result.trxID;
      payment.paidAt = new Date();
      payment.providerResponse = result;

      await this.paymentRepository.save(payment);
      await this.ordersService.updateStatus(payment.orderId, OrderStatus.CONFIRMED);
      this.eventEmitter.emit('payment.completed', payment);
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failedAt = new Date();
      payment.failureReason = result.statusMessage;
      await this.paymentRepository.save(payment);
    }

    return payment;
  }

  async createCODPayment(tenantId: string, orderId: string) {
    const order = await this.ordersService.findById(orderId);

    const payment = this.paymentRepository.create({
      tenantId,
      orderId,
      amount: order.total,
      currency: order.currency,
      provider: PaymentProvider.COD,
      status: PaymentStatus.PENDING,
    });

    return this.paymentRepository.save(payment);
  }

  async markCODPaid(paymentId: string) {
    const payment = await this.paymentRepository.findOneByOrFail({ id: paymentId });
    payment.status = PaymentStatus.COMPLETED;
    payment.paidAt = new Date();
    await this.paymentRepository.save(payment);
    this.eventEmitter.emit('payment.completed', payment);
    return payment;
  }

  async getStats(tenantId?: string) {
    const qb = this.paymentRepository.createQueryBuilder('p');
    if (tenantId) qb.where('p.tenantId = :tenantId', { tenantId });
    return qb
      .select([
        'SUM(CASE WHEN p.status = :completed THEN p.amount ELSE 0 END) as totalRevenue',
        'COUNT(CASE WHEN p.status = :completed THEN 1 END) as successfulPayments',
        'COUNT(CASE WHEN p.status = :failed THEN 1 END) as failedPayments',
      ])
      .setParameter('completed', PaymentStatus.COMPLETED)
      .setParameter('failed', PaymentStatus.FAILED)
      .getRawOne();
  }
}
