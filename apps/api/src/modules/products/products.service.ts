import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductImageEntity } from './entities/product-image.entity';
import { paginate } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ProductStatus } from '@saas-commerce/types';
import { slugify } from '@saas-commerce/utils';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductVariantEntity)
    private variantRepository: Repository<ProductVariantEntity>,
    @InjectRepository(ProductImageEntity)
    private imageRepository: Repository<ProductImageEntity>,
  ) {}

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
    filters?: { categoryId?: string; status?: ProductStatus },
  ) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.tenantId = :tenantId', { tenantId });

    if (filters?.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: filters.categoryId });
    }
    if (filters?.status) {
      qb.andWhere('product.status = :status', { status: filters.status });
    }
    if (query.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy(`product.${query.sortBy || 'createdAt'}`, query.sortOrder || 'DESC');

    return paginate(qb, query.page || 1, query.limit || 20);
  }

  async findPublic(tenantId: string, query: PaginationQueryDto, filters?: { categoryId?: string }) {
    return this.findAll(tenantId, query, {
      ...filters,
      status: ProductStatus.ACTIVE,
    });
  }

  async findById(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['images', 'variants', 'category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findBySlug(tenantId: string, slug: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { tenantId, slug },
      relations: ['images', 'variants', 'category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(tenantId: string, data: Partial<ProductEntity>): Promise<ProductEntity> {
    if (!data.slug && data.name) {
      data.slug = slugify(data.name as string);
    }
    const existing = await this.productRepository.findOne({
      where: { tenantId, slug: data.slug },
    });
    if (existing) data.slug = `${data.slug}-${Date.now()}`;

    const product = this.productRepository.create({ ...data, tenantId });
    return this.productRepository.save(product);
  }

  async update(id: string, updates: Partial<ProductEntity>): Promise<ProductEntity> {
    const product = await this.findById(id);
    Object.assign(product, updates);
    return this.productRepository.save(product);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);
    await this.productRepository.remove(product);
  }

  async bulkUpdateStatus(ids: string[], status: ProductStatus): Promise<void> {
    await this.productRepository.update(ids, { status });
  }

  async addVariant(productId: string, data: Partial<ProductVariantEntity>) {
    const product = await this.findById(productId);
    const variant = this.variantRepository.create({ ...data, productId });
    return this.variantRepository.save(variant);
  }

  async updateVariant(variantId: string, data: Partial<ProductVariantEntity>) {
    await this.variantRepository.update(variantId, data);
    return this.variantRepository.findOneByOrFail({ id: variantId });
  }

  async deleteVariant(variantId: string) {
    await this.variantRepository.delete(variantId);
  }

  async addImage(productId: string, url: string, alt?: string) {
    const count = await this.imageRepository.count({ where: { productId } });
    const image = this.imageRepository.create({
      productId, url, alt, position: count, isDefault: count === 0,
    });
    return this.imageRepository.save(image);
  }

  async deleteImage(imageId: string) {
    await this.imageRepository.delete(imageId);
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.productRepository.count({ where: { tenantId } });
  }
}
