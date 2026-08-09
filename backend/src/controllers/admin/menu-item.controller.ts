import { menuItemService } from '../../services/admin/menu-item.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const menuItemController = {
  list: asyncHandler(async (req, res) => {
    const isAvailable =
      req.query.is_available === undefined ? undefined : req.query.is_available === 'true';
    const data = await menuItemService.list({
      restaurant_id: typeof req.query.restaurant_id === 'string' ? req.query.restaurant_id : undefined,
      category_id: typeof req.query.category_id === 'string' ? req.query.category_id : undefined,
      is_available: isAvailable,
      search: typeof req.query.search === 'string' ? req.query.search : undefined
    });
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await menuItemService.getById(req.params.id as string);
    return sendSuccess(res, data);
  }),

  create: asyncHandler(async (req, res) => {
    const data = await menuItemService.create(req.params.id as string, req.body);
    return sendSuccess(res, data, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await menuItemService.update(req.params.id as string, req.body);
    return sendSuccess(res, data);
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await menuItemService.softDelete(req.params.id as string);
    return sendSuccess(res, data);
  }),

  listAddons: asyncHandler(async (_req, res) => {
    const data = await menuItemService.listAddons();
    return sendSuccess(res, data);
  }),

  createAddon: asyncHandler(async (req, res) => {
    const data = await menuItemService.createAddon(req.body);
    return sendSuccess(res, data, 201);
  }),

  updateAddon: asyncHandler(async (req, res) => {
    const data = await menuItemService.updateAddon(req.params.id as string, req.body);
    return sendSuccess(res, data);
  })
};
