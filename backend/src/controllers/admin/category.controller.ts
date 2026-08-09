import { categoryService } from '../../services/admin/category.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const categoryController = {
  list: asyncHandler(async (req, res) => {
    const isActive =
      req.query.is_active === undefined ? undefined : req.query.is_active === 'true';
    const data = await categoryService.list({ is_active: isActive });
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await categoryService.getById(req.params.id as string);
    return sendSuccess(res, data);
  }),

  create: asyncHandler(async (req, res) => {
    const data = await categoryService.create(req.body);
    return sendSuccess(res, data, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await categoryService.update(req.params.id as string, req.body);
    return sendSuccess(res, data);
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await categoryService.remove(req.params.id as string);
    return sendSuccess(res, data);
  })
};
