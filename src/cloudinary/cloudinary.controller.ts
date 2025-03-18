import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryStorageConfig } from '../config/cloudinary.storage';
import * as Multer from 'multer';

@Controller('upload')
export class UploadController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, { storage: CloudinaryStorageConfig }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const uploadedFiles = await Promise.all(
      files.map((file) => this.cloudinaryService.uploadImage(file)),
    );
    return { urls: uploadedFiles.map((file: any) => file.secure_url) };
  }
}
