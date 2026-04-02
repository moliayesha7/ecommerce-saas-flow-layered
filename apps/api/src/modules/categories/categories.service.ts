import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { slugify } from '@saas-commerce/utils';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(tenantId: string | null, parentId?: string | null) {
    const qb = this.categoryRepository
      .createQueryBuilder('cat')
      .leftJoinAndSelect('cat.children', 'children')
      .where('cat.isActive = true');

    // null = global categories, string = tenant-specific
    if (tenantId === null) {
      qb.andWhere('cat.tenantId IS NULL');
    } else {
      qb.andWhere('(cat.tenantId = :tenantId OR cat.tenantId IS NULL)', { tenantId });
    }

    if (parentId !== undefined) {
      parentId === null
        ? qb.andWhere('cat.parentId IS NULL')
        : qb.andWhere('cat.parentId = :parentId', { parentId });
    }

    qb.orderBy('cat.sortOrder', 'ASC').addOrderBy('cat.name', 'ASC');
    return qb.getMany();
  }

  async findById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    if (!data.slug && data.name) {
      data.slug = slugify(data.name);
    }
    const existing = await this.categoryRepository.findOne({
      where: { slug: data.slug, tenantId: data.tenantId ?? IsNull() },
    });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async update(id: string, updates: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const category = await this.findById(id);
    Object.assign(category, updates);
    return this.categoryRepository.save(category);
  }

  async delete(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.categoryRepository.remove(category);
  }

  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    await Promise.all(
      items.map((item) =>
        this.categoryRepository.update(item.id, { sortOrder: item.sortOrder }),
      ),
    );
  }
}
