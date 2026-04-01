import {
  Controller, Get, Post, Delete, Param, UseGuards, UseInterceptors,
  UploadedFile, UploadedFiles, ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@saas-commerce/types';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('subscriber/uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload single file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthUser) {
    return this.uploadsService.uploadFile(file, user.tenantId, user.id);
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[], @CurrentUser() user: AuthUser) {
    return Promise.all(files.map((f) => this.uploadsService.uploadFile(f, user.tenantId, user.id)));
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded media' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.uploadsService.findAll(user.tenantId!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.uploadsService.delete(id);
  }
}
