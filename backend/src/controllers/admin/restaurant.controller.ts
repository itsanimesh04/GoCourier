import { restaurantService } from '../../services/admin/restaurant.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const restaurantController = {
  list: asyncHandler(async (req, res) => {
    const isActive =
      req.query.is_active === undefined ? undefined : req.query.is_active === 'true';
    const data = await restaurantService.list({
      is_active: isActive,
      search: typeof req.query.search === 'string' ? req.query.search : undefined
    });
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await restaurantService.getById(req.params.id as string);
    return sendSuccess(res, data);
  }),

  create: asyncHandler(async (req, res) => {
    const data = await restaurantService.create(req.body);
    return sendSuccess(res, data, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await restaurantService.update(req.params.id as string, req.body);
    return sendSuccess(res, data);
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await restaurantService.softDelete(req.params.id as string);
    return sendSuccess(res, data);
  })
};
