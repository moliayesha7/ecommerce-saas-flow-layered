import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';
import { PlansService } from '../plans/plans.service';
import { SubscriptionStatus } from '@saas-commerce/types';
import { addDays } from '@saas-commerce/utils';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private subscriptionRepository: Repository<SubscriptionEntity>,
    private plansService: PlansService,
  ) {}

  async findByTenant(tenantId: string) {
    return this.subscriptionRepository.findOne({
      where: { tenantId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.subscriptionRepository.find({
      relations: ['plan', 'tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(tenantId: string, planId: string): Promise<SubscriptionEntity> {
    const plan = await this.plansService.findById(planId);

    const now = new Date();
    const periodEnd =
      plan.interval === 'yearly'
        ? addDays(now, 365)
        : addDays(now, 30);

    const trialEndsAt = plan.trialDays > 0 ? addDays(now, plan.trialDays) : undefined;

    const subscription = this.subscriptionRepository.create({
      tenantId,
      planId,
      status: trialEndsAt ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialEndsAt,
      amount: plan.price,
      currency: plan.currency,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async cancel(tenantId: string, reason?: string) {
    const sub = await this.findByTenant(tenantId);
    if (!sub) throw new NotFoundException('No active subscription found');
    sub.status = SubscriptionStatus.CANCELLED;
    sub.cancelledAt = new Date();
    sub.cancelReason = reason;
    return this.subscriptionRepository.save(sub);
  }

  async renew(tenantId: string): Promise<SubscriptionEntity> {
    const sub = await this.findByTenant(tenantId);
    if (!sub) throw new NotFoundException('Subscription not found');

    const plan = await this.plansService.findById(sub.planId);
    const now = new Date();
    sub.currentPeriodStart = now;
    sub.currentPeriodEnd = plan.interval === 'yearly' ? addDays(now, 365) : addDays(now, 30);
    sub.status = SubscriptionStatus.ACTIVE;

    return this.subscriptionRepository.save(sub);
  }

  async getExpiringSubscriptions(daysAhead = 7): Promise<SubscriptionEntity[]> {
    const target = addDays(new Date(), daysAhead);
    return this.subscriptionRepository
      .createQueryBuilder('sub')
      .where('sub.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('sub.currentPeriodEnd <= :target', { target })
      .andWhere('sub.currentPeriodEnd > NOW()')
      .getMany();
  }
}
