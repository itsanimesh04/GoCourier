import { optionSetService } from '../../services/admin/option-set.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const optionSetController = {
  list: asyncHandler(async (_req, res) => {
    const data = await optionSetService.list();
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await optionSetService.getById(req.params.id as string);
    return sendSuccess(res, data);
  }),

  create: asyncHandler(async (req, res) => {
    const data = await optionSetService.create(req.body);
    return sendSuccess(res, data, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await optionSetService.update(req.params.id as string, req.body);
    return sendSuccess(res, data);
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await optionSetService.remove(req.params.id as string);
    return sendSuccess(res, data);
  })
};
