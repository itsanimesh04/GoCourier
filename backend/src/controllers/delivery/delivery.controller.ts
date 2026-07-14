import { deliveryService } from '../../services/delivery/delivery.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const deliveryController = {
  getMyBatches: asyncHandler(async (req, res) => {
    const date = req.query.date as string | undefined;
    const batches = await deliveryService.getMyBatches(req.user!.id, date);
    return sendSuccess(res, batches);
  }),

  getBatchById: asyncHandler(async (req, res) => {
    const batch = await deliveryService.getBatchById(req.params.id as string, req.user!.id);
    return sendSuccess(res, batch);
  }),

  startBatch: asyncHandler(async (req, res) => {
    const batch = await deliveryService.startBatch(req.params.id as string, req.user!.id);
    return sendSuccess(res, batch);
  }),

  deliverOrder: asyncHandler(async (req, res) => {
    const result = await deliveryService.deliverOrder(req.params.id as string, req.body, req.user!.id);
    return sendSuccess(res, result);
  }),

  markNotDelivered: asyncHandler(async (req, res) => {
    const result = await deliveryService.markNotDelivered(req.params.id as string, req.body.reason, req.user!.id);
    return sendSuccess(res, result);
  })
};
