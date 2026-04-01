import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationType } from '@saas-commerce/types';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notifRepository: Repository<NotificationEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(data: {
    userId: string;
    tenantId?: string;
    type: NotificationType;
    title: string;
    message: string;
    notifData?: Record<string, unknown>;
  }) {
    const notif = this.notifRepository.create({
      userId: data.userId,
      tenantId: data.tenantId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.notifData,
    });
    const saved = await this.notifRepository.save(notif);
    this.eventEmitter.emit('notification.created', { userId: data.userId, notification: saved });
    return saved;
  }

  async findByUser(userId: string, unreadOnly = false) {
    const where: Record<string, unknown> = { userId };
    if (unreadOnly) where.isRead = false;
    return this.notifRepository.find({ where, order: { createdAt: 'DESC' }, take: 50 });
  }

  async markRead(id: string) {
    await this.notifRepository.update(id, { isRead: true, readAt: new Date() });
  }

  async markAllRead(userId: string) {
    await this.notifRepository.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
  }

  async countUnread(userId: string) {
    return this.notifRepository.count({ where: { userId, isRead: false } });
  }
}
