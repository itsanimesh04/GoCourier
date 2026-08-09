import { adminOrderService } from '../../services/admin/order.service';
import type { OrderStatus } from '../../models/order.model';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const adminOrderController = {
  list: asyncHandler(async (req, res) => {
    const data = await adminOrderService.list({
      order_status:
        typeof req.query.order_status === 'string'
          ? (req.query.order_status as OrderStatus)
          : undefined,
      payment_status:
        typeof req.query.payment_status === 'string' ? req.query.payment_status : undefined,
      campus_id: typeof req.query.campus_id === 'string' ? req.query.campus_id : undefined,
      restaurant_id:
        typeof req.query.restaurant_id === 'string' ? req.query.restaurant_id : undefined,
      from: typeof req.query.from === 'string' ? req.query.from : undefined,
      to: typeof req.query.to === 'string' ? req.query.to : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    });
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await adminOrderService.getById(req.params.id as string);
    return sendSuccess(res, data);
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const data = await adminOrderService.updateStatus(
      req.params.id as string,
      req.body.order_status
    );
    return sendSuccess(res, data);
  })
};
