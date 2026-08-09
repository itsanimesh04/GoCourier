import { bannerService } from '../../services/admin/banner.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const bannerController = {
  list: asyncHandler(async (req, res) => {
    const isActive =
      req.query.is_active === undefined ? undefined : req.query.is_active === 'true';
    const data = await bannerService.list({ is_active: isActive });
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await bannerService.getById(req.params.id as string);
    return sendSuccess(res, data);
  }),

  create: asyncHandler(async (req, res) => {
    const data = await bannerService.create(req.body);
    return sendSuccess(res, data, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await bannerService.update(req.params.id as string, req.body);
    return sendSuccess(res, data);
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await bannerService.remove(req.params.id as string);
    return sendSuccess(res, data);
  })
};
