import { extraProductService } from '../../services/admin/extra-product.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const extraProductController = {
  list: asyncHandler(async (req, res) => {
    const available =
      req.query.available === undefined ? undefined : req.query.available === 'true';
    const data = await extraProductService.list({
      campus_id: typeof req.query.campus_id === 'string' ? req.query.campus_id : undefined,
      available,
      search: typeof req.query.search === 'string' ? req.query.search : undefined
    });
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await extraProductService.getById(req.params.id as string);
    return sendSuccess(res, data);
  }),

  create: asyncHandler(async (req, res) => {
    const data = await extraProductService.create(req.body);
    return sendSuccess(res, data, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await extraProductService.update(req.params.id as string, req.body);
    return sendSuccess(res, data);
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await extraProductService.remove(req.params.id as string);
    return sendSuccess(res, data);
  })
};
