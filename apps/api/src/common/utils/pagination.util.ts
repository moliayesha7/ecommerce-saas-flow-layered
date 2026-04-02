import { PaginatedResult } from '@saas-commerce/types';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export async function paginate<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  page: number,
  limit: number,
): Promise<PaginatedResult<T>> {
  // Offset paginationis computatur
  const skip = (page - 1) * limit;

  // Data et numerus totalis petuntur
  const [data, total] = await queryBuilder
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  // Numerus paginarum computatur
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}