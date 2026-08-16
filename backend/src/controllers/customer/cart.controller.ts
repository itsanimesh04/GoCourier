import { cartService } from '../../services/customer/cart.service';
import { userRepository } from '../../repositories/user.repository';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const cartController = {
  create: asyncHandler(async (req, res) => {
    const user = await userRepository.findById(req.user!.id);
    const cart = await cartService.createOrReplaceCart(
      req.user!.id,
      user?.campus_id ?? null,
      req.body
    );
    return sendSuccess(res, cart, 201);
  }),

  get: asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user!.id);
    return sendSuccess(res, cart);
  })
};
