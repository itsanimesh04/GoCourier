import { adminConfigService } from '../../services/admin/config.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const adminConfigController = {
  get: asyncHandler(async (_req, res) => {
    const data = await adminConfigService.get();
    return sendSuccess(res, data);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await adminConfigService.update(req.body);
    return sendSuccess(res, data);
  })
};
