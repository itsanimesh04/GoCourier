import { customerOrderService } from '../../services/customer/order.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const customerOrderController = {
  list: asyncHandler(async (req, res) => {
    const orders = await customerOrderService.listMine(req.user!.id, {
      page: req.query.page as unknown as number,
      limit: req.query.limit as unknown as number
    });
    return sendSuccess(res, orders);
  }),

  detail: asyncHandler(async (req, res) => {
    const order = await customerOrderService.getDetail(req.user!.id, req.params.id as string);
    return sendSuccess(res, order);
  }),

  create: asyncHandler(async (req, res) => {
    const order = await customerOrderService.createFromCart(req.user!.id, req.body.drop_point);
    return sendSuccess(res, order, 201);
  }),

  pay: asyncHandler(async (req, res) => {
    const session = await customerOrderService.initiatePayment(req.user!.id, req.params.id as string);
    return sendSuccess(res, session);
  })
};
