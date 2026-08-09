import { adminUploadService } from '../../services/admin/upload.service';
import { BadRequestError } from '../../utils/errors';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const uploadController = {
  upload: asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) throw new BadRequestError('File is required');
    const folder = typeof req.body.folder === 'string' ? req.body.folder : 'misc';
    const data = await adminUploadService.upload(file, folder);
    return sendSuccess(res, data, 201);
  }),

  replace: asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) throw new BadRequestError('File is required');
    const folder = typeof req.body.folder === 'string' ? req.body.folder : 'misc';
    const oldKey = typeof req.body.old_key === 'string' ? req.body.old_key : undefined;
    const data = await adminUploadService.replace(file, oldKey, folder);
    return sendSuccess(res, data);
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await adminUploadService.delete(req.body.key);
    return sendSuccess(res, data);
  })
};
