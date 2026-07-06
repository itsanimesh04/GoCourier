import { customerOrderService } from '../../services/customer/order.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const customerOrderController = {
  create: asyncHandler(async (req, res) => {
    const order = await customerOrderService.createFromCart(req.user!.id, req.body.drop_point);
    return sendSuccess(res, order, 201);
  }),

  pay: asyncHandler(async (req, res) => {
    const session = await customerOrderService.initiatePayment(req.user!.id, req.params.id as string);
    return sendSuccess(res, session);
  })
};
