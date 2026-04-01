import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from '../../common/utils/hash.util';
import { paginate } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserRole } from '@saas-commerce/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findAll(query: PaginationQueryDto, filters?: { tenantId?: string; role?: UserRole }) {
    const qb = this.userRepository.createQueryBuilder('user');

    if (filters?.tenantId) {
      qb.andWhere('user.tenantId = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters?.role) {
      qb.andWhere('user.role = :role', { role: filters.role });
    }

    if (query.search) {
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy(`user.${query.sortBy || 'createdAt'}`, query.sortOrder || 'DESC');

    return paginate(qb, query.page || 1, query.limit || 20);
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await hashPassword(dto.password);
    const user = this.userRepository.create({
      ...dto,
      email: dto.email.toLowerCase(),
      passwordHash,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.findById(id);
    Object.assign(user, updates);
    return this.userRepository.save(user);
  }

  async deactivate(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.update(id, { isActive: false });
  }

  async activate(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.update(id, { isActive: true });
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.userRepository.count({ where: { tenantId } });
  }
}
