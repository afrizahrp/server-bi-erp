import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller(':company_id/:module_id/upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Public()
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: undefined,
      limits: { fileSize: 5 * 1024 * 1024 }, // Maks 5MB
    } as MulterOptions),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const uploadedFiles = await Promise.all(
      files.map((file) => this.cloudinaryService.uploadImage(file)),
    );

    return { urls: uploadedFiles.map((file: any) => file.secure_url) };
  }

  // @Public()
  // @Delete('delete')
  // async deleteImage(@Query('publicId') publicId: string) {
  //   return this.cloudinaryService.deleteImage(publicId);
  // }

  @Public()
  @Delete('cloudinary/delete')
  async deleteFile(@Query('publicId') publicId: string) {
    return await this.cloudinaryService.deleteImage(publicId);
  }
}
