import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { TenantSettingsEntity } from './entities/tenant-settings.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { paginate } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { TenantStatus } from '@saas-commerce/types';
import { slugify } from '@saas-commerce/utils';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private tenantRepository: Repository<TenantEntity>,
    @InjectRepository(TenantSettingsEntity)
    private settingsRepository: Repository<TenantSettingsEntity>,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const qb = this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.settings', 'settings');

    if (query.search) {
      qb.andWhere(
        '(tenant.name ILIKE :search OR tenant.email ILIKE :search OR tenant.slug ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy(`tenant.${query.sortBy || 'createdAt'}`, query.sortOrder || 'DESC');

    return paginate(qb, query.page || 1, query.limit || 20);
  }

  async findById(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['settings'],
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findBySlug(slug: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { slug },
      relations: ['settings'],
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(dto: CreateTenantDto, ownerId: string): Promise<TenantEntity> {
    const slug = slugify(dto.name);
    const existingSlug = await this.tenantRepository.findOne({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const existingEmail = await this.tenantRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) throw new ConflictException('Email already in use');

    const tenant = this.tenantRepository.create({
      ...dto,
      slug: finalSlug,
      ownerId,
      status: TenantStatus.PENDING,
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    // Create default settings
    const settings = this.settingsRepository.create({
      tenantId: savedTenant.id,
    });
    await this.settingsRepository.save(settings);

    return this.findById(savedTenant.id);
  }

  async approve(id: string): Promise<TenantEntity> {
    const tenant = await this.findById(id);
    tenant.status = TenantStatus.ACTIVE;
    tenant.approvedAt = new Date();
    return this.tenantRepository.save(tenant);
  }

  async suspend(id: string, reason: string): Promise<TenantEntity> {
    const tenant = await this.findById(id);
    tenant.status = TenantStatus.SUSPENDED;
    tenant.suspendedAt = new Date();
    tenant.suspensionReason = reason;
    return this.tenantRepository.save(tenant);
  }

  async activate(id: string): Promise<TenantEntity> {
    const tenant = await this.findById(id);
    tenant.status = TenantStatus.ACTIVE;
    tenant.suspendedAt = undefined;
    tenant.suspensionReason = undefined;
    return this.tenantRepository.save(tenant);
  }

  async update(id: string, updates: Partial<TenantEntity>): Promise<TenantEntity> {
    const tenant = await this.findById(id);
    Object.assign(tenant, updates);
    return this.tenantRepository.save(tenant);
  }

  async updateSettings(tenantId: string, updates: Partial<TenantSettingsEntity>): Promise<TenantSettingsEntity> {
    let settings = await this.settingsRepository.findOne({ where: { tenantId } });
    if (!settings) {
      settings = this.settingsRepository.create({ tenantId });
    }
    Object.assign(settings, updates);
    return this.settingsRepository.save(settings);
  }

  async getSettings(tenantId: string): Promise<TenantSettingsEntity | null> {
    return this.settingsRepository.findOne({ where: { tenantId } });
  }

  async getStats() {
    const total = await this.tenantRepository.count();
    const active = await this.tenantRepository.count({ where: { status: TenantStatus.ACTIVE } });
    const pending = await this.tenantRepository.count({ where: { status: TenantStatus.PENDING } });
    const suspended = await this.tenantRepository.count({ where: { status: TenantStatus.SUSPENDED } });
    return { total, active, pending, suspended };
  }
}
