import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEntity } from './entities/plan.entity';
import { slugify } from '@saas-commerce/utils';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(PlanEntity)
    private planRepository: Repository<PlanEntity>,
  ) {}

  async findAll(includeInactive = false) {
    const qb = this.planRepository.createQueryBuilder('plan');
    if (!includeInactive) qb.where('plan.isActive = true');
    qb.orderBy('plan.sortOrder', 'ASC');
    return qb.getMany();
  }

  async findById(id: string): Promise<PlanEntity> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async create(data: Partial<PlanEntity>): Promise<PlanEntity> {
    if (!data.slug && data.name) {
      data.slug = slugify(data.name);
    }
    const plan = this.planRepository.create(data);
    return this.planRepository.save(plan);
  }

  async update(id: string, updates: Partial<PlanEntity>): Promise<PlanEntity> {
    const plan = await this.findById(id);
    Object.assign(plan, updates);
    return this.planRepository.save(plan);
  }

  async delete(id: string): Promise<void> {
    const plan = await this.findById(id);
    await this.planRepository.remove(plan);
  }
}
