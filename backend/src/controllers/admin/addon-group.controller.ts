import { addonGroupService } from '../../services/admin/addon-group.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const addonGroupController = {
  list: asyncHandler(async (_req, res) => {
    const data = await addonGroupService.list();
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await addonGroupService.getById(req.params.id as string);
    return sendSuccess(res, data);
  }),

  create: asyncHandler(async (req, res) => {
    const data = await addonGroupService.create(req.body);
    return sendSuccess(res, data, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await addonGroupService.update(req.params.id as string, req.body);
    return sendSuccess(res, data);
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await addonGroupService.remove(req.params.id as string);
    return sendSuccess(res, data);
  })
};
