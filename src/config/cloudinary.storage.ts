import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

export const CloudinaryStorageConfig = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: 'auto',
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
    folder: 'upload',
    allowed_formats: ['jpg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  } as any,
});
