import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

export const CloudinaryStorageConfig = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: 'auto',
    folder: '', // Pastikan tidak ada folder default
    public_id: (req, file) => file.originalname.split('.')[0], // Tanpa timestamp
    use_filename: true,
    allowed_formats: ['jpg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  } as any,
});
