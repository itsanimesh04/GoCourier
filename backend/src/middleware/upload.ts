import multer from 'multer';
import { BadRequestError } from '../utils/errors';

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      cb(new BadRequestError('Only JPEG, PNG, WebP, and GIF images are allowed'));
      return;
    }
    cb(null, true);
  }
});
