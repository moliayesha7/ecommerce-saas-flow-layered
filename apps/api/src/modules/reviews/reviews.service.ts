import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';
import { paginate } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
  ) {}

  async findByProduct(productId: string, query: PaginationQueryDto) {
    const qb = this.reviewRepository
      .createQueryBuilder('r')
      .where('r.productId = :productId', { productId })
      .andWhere('r.isApproved = true')
      .orderBy('r.createdAt', 'DESC');
    return paginate(qb, query.page || 1, query.limit || 10);
  }

  async findByTenant(tenantId: string, query: PaginationQueryDto) {
    const qb = this.reviewRepository
      .createQueryBuilder('r')
      .where('r.tenantId = :tenantId', { tenantId })
      .orderBy('r.createdAt', 'DESC');
    return paginate(qb, query.page || 1, query.limit || 20);
  }

  async create(data: Partial<ReviewEntity>) {
    const review = this.reviewRepository.create(data);
    return this.reviewRepository.save(review);
  }

  async approve(id: string) {
    await this.reviewRepository.update(id, { isApproved: true, approvedAt: new Date() });
    return this.reviewRepository.findOneByOrFail({ id });
  }

  async delete(id: string) {
    await this.reviewRepository.delete(id);
  }

  async getProductRating(productId: string): Promise<{ average: number; count: number }> {
    const result = await this.reviewRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'average')
      .addSelect('COUNT(*)', 'count')
      .where('r.productId = :productId', { productId })
      .andWhere('r.isApproved = true')
      .getRawOne();
    return { average: parseFloat(result.average) || 0, count: parseInt(result.count) || 0 };
  }
}
