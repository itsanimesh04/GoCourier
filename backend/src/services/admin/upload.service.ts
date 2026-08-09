import { s3Service } from '../storage/s3.service';

export class AdminUploadService {
  async upload(file: Express.Multer.File, folder?: string) {
    return s3Service.upload(file, folder);
  }

  async replace(file: Express.Multer.File, oldKey: string | undefined, folder?: string) {
    return s3Service.replace(file, oldKey, folder);
  }

  async delete(key: string) {
    return s3Service.delete(key);
  }
}

export const adminUploadService = new AdminUploadService();
