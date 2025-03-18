import { Module } from '@nestjs/common';
import { CloudinaryConfig } from '../config/cloudinary.config';
import { CloudinaryService } from './cloudinary.service';

@Module({
  providers: [CloudinaryConfig, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
