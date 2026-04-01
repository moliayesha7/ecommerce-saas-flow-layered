import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../orders/entities/order.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { UserEntity } from '../users/entities/user.entity';
import { OrderStatus, PaymentStatus, TenantStatus, UserRole } from '@saas-commerce/types';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(OrderEntity) private orderRepo: Repository<OrderEntity>,
    @InjectRepository(PaymentEntity) private paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(ProductEntity) private productRepo: Repository<ProductEntity>,
    @InjectRepository(TenantEntity) private tenantRepo: Repository<TenantEntity>,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async getAdminDashboard() {
    const [totalTenants, activeTenants, pendingTenants] = await Promise.all([
      this.tenantRepo.count(),
      this.tenantRepo.count({ where: { status: TenantStatus.ACTIVE } }),
      this.tenantRepo.count({ where: { status: TenantStatus.PENDING } }),
    ]);

    const revenueResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    const [totalOrders, pendingOrders] = await Promise.all([
      this.orderRepo.count(),
      this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),
    ]);

    const activeCustomers = await this.userRepo.count({
      where: { role: UserRole.CUSTOMER, isActive: true },
    });

    return {
      totalTenants,
      activeTenants,
      pendingTenants,
      totalRevenue: parseFloat(revenueResult?.total || '0'),
      totalOrders,
      pendingOrders,
      activeCustomers,
    };
  }

  async getSubscriberDashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, pendingOrders, totalProducts] = await Promise.all([
      this.orderRepo.count({ where: { tenantId } }),
      this.orderRepo.count({ where: { tenantId, status: OrderStatus.PENDING } }),
      this.productRepo.count({ where: { tenantId } }),
    ]);

    const todaySalesResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.tenantId = :tenantId', { tenantId })
      .andWhere('p.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('p.paidAt >= :today', { today })
      .getRawOne();

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthRevenueResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.tenantId = :tenantId', { tenantId })
      .andWhere('p.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('p.paidAt >= :monthStart', { monthStart })
      .getRawOne();

    return {
      todaySales: parseFloat(todaySalesResult?.total || '0'),
      monthRevenue: parseFloat(monthRevenueResult?.total || '0'),
      totalOrders,
      pendingOrders,
      totalProducts,
    };
  }

  async getSalesTrend(tenantId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.paymentRepo
      .createQueryBuilder('p')
      .select("DATE_TRUNC('day', p.paidAt)", 'date')
      .addSelect('SUM(p.amount)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where('p.tenantId = :tenantId', { tenantId })
      .andWhere('p.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('p.paidAt >= :startDate', { startDate })
      .groupBy("DATE_TRUNC('day', p.paidAt)")
      .orderBy("DATE_TRUNC('day', p.paidAt)", 'ASC')
      .getRawMany();
  }
}
