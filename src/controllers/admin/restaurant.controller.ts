import { restaurantService } from '../../services/admin/restaurant.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const restaurantController = {
  create: asyncHandler(async (req, res) => {
    const restaurant = await restaurantService.create(req.body);
    return sendSuccess(res, restaurant, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const restaurant = await restaurantService.update(req.params.id as string, req.body);
    return sendSuccess(res, restaurant);
  })
};
