import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { MediaEntity } from './entities/media.entity';
import { MediaType } from '@saas-commerce/types';

@Injectable()
export class UploadsService {
  private readonly uploadPath: string;

  constructor(
    @InjectRepository(MediaEntity)
    private mediaRepository: Repository<MediaEntity>,
    private configService: ConfigService,
  ) {
    this.uploadPath = configService.get('storage.localPath', './uploads');
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    tenantId: string | undefined,
    uploadedBy: string,
  ): Promise<MediaEntity> {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const subDir = tenantId || 'public';
    const dir = path.join(this.uploadPath, subDir);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(path.join(dir, filename), file.buffer);

    const url = `/uploads/${subDir}/${filename}`;

    const media = this.mediaRepository.create({
      tenantId,
      uploadedBy,
      url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      type: file.mimetype.startsWith('image/') ? MediaType.IMAGE : MediaType.DOCUMENT,
    });

    return this.mediaRepository.save(media);
  }

  async findAll(tenantId: string) {
    return this.mediaRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async delete(id: string) {
    const media = await this.mediaRepository.findOneByOrFail({ id });
    const filePath = path.join(process.cwd(), media.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await this.mediaRepository.delete(id);
  }
}
