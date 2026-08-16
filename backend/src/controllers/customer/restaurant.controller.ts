import { customerRestaurantService } from '../../services/customer/restaurant.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const customerRestaurantController = {
  list: asyncHandler(async (req, res) => {
    const restaurants = await customerRestaurantService.list(
      req.query.campus_id as string,
      req.query.q as string | undefined
    );
    return sendSuccess(res, restaurants);
  }),

  getById: asyncHandler(async (req, res) => {
    const restaurant = await customerRestaurantService.getById(req.params.id as string);
    return sendSuccess(res, restaurant);
  }),

  menu: asyncHandler(async (req, res) => {
    const menu = await customerRestaurantService.getMenu(req.params.id as string);
    return sendSuccess(res, menu);
  }),

  menuItem: asyncHandler(async (req, res) => {
    const data = await customerRestaurantService.getMenuItem(req.params.id as string);
    return sendSuccess(res, data);
  })
};
