import { cartService } from '../../services/customer/cart.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const cartController = {
  create: asyncHandler(async (req, res) => {
    const cart = await cartService.createOrReplaceCart(req.user!.id, req.user!.campus_id, req.body);
    return sendSuccess(res, cart, 201);
  }),

  get: asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user!.id);
    return sendSuccess(res, cart);
  })
};
