import { menuItemService } from '../../services/admin/menu-item.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const menuItemController = {
  create: asyncHandler(async (req, res) => {
    const menuItem = await menuItemService.create(req.params.id as string, req.body);
    return sendSuccess(res, menuItem, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const menuItem = await menuItemService.update(req.params.id as string, req.body);
    return sendSuccess(res, menuItem);
  })
};
