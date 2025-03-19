import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<any> {
    if (!file || !file.buffer) {
      throw new Error('File buffer is empty');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        // { folder: 'upload' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(error);
          }
          resolve(result);
        },
      );

      // Convert buffer ke Readable Stream
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true, // Pastikan cache Cloudinary dihapus
      });

      if (result.result !== 'ok') {
        throw new Error('Failed to delete image');
      }

      return result;
    } catch (error) {
      throw new Error(`Cloudinary delete error: ${error.message}`);
    }
  }
}
