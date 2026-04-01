import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponEntity } from './entities/coupon.entity';
import { DiscountType } from '@saas-commerce/types';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(CouponEntity)
    private couponRepository: Repository<CouponEntity>,
  ) {}

  async findAll(tenantId: string) {
    return this.couponRepository.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: string) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async create(tenantId: string, data: Partial<CouponEntity>) {
    const existing = await this.couponRepository.findOne({
      where: { tenantId, code: data.code?.toUpperCase() },
    });
    if (existing) throw new BadRequestException('Coupon code already exists');
    const coupon = this.couponRepository.create({ ...data, tenantId, code: data.code?.toUpperCase() });
    return this.couponRepository.save(coupon);
  }

  async update(id: string, data: Partial<CouponEntity>) {
    await this.findById(id);
    await this.couponRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.couponRepository.delete(id);
  }

  async validate(tenantId: string, code: string, orderTotal: number) {
    const coupon = await this.couponRepository.findOne({
      where: { tenantId, code: code.toUpperCase(), isActive: true },
    });
    if (!coupon) throw new BadRequestException('Invalid coupon code');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Coupon expired');
    if (coupon.startsAt && coupon.startsAt > new Date()) throw new BadRequestException('Coupon not yet active');
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached');
    if (orderTotal < Number(coupon.minOrderAmount)) throw new BadRequestException(`Minimum order amount is ${coupon.minOrderAmount}`);

    let discountAmount = 0;
    if (coupon.type === DiscountType.PERCENTAGE) {
      discountAmount = (orderTotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
    } else if (coupon.type === DiscountType.FIXED_AMOUNT) {
      discountAmount = Number(coupon.value);
    } else if (coupon.type === DiscountType.FREE_SHIPPING) {
      discountAmount = 0; // handled at shipping level
    }

    return { coupon, discountAmount };
  }

  async incrementUsage(id: string) {
    await this.couponRepository.increment({ id }, 'usageCount', 1);
  }
}
