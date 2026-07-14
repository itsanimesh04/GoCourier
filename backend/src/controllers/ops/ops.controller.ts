import { opsService } from '../../services/ops/ops.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const opsController = {
  getBatchDetail: asyncHandler(async (req, res) => {
    const batch = await opsService.getBatchDetail(req.params.id as string);
    return sendSuccess(res, batch);
  }),

  updateProcurementTask: asyncHandler(async (req, res) => {
    const task = await opsService.updateProcurementTask(req.params.id as string, req.body, req.user!.id);
    return sendSuccess(res, task);
  }),

  markOrderItemConfirmed: asyncHandler(async (req, res) => {
    const item = await opsService.markOrderItemConfirmed(req.params.id as string, req.user!.id);
    return sendSuccess(res, item);
  }),

  markOrderItemUnavailable: asyncHandler(async (req, res) => {
    const result = await opsService.markOrderItemUnavailable(
      req.params.id as string,
      req.body.reason,
      req.user!.id
    );
    return sendSuccess(res, result);
  }),

  listRefunds: asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const refunds = await opsService.listRefunds(status);
    return sendSuccess(res, refunds);
  }),

  initiateRefund: asyncHandler(async (req, res) => {
    const refund = await opsService.initiateRefund(req.params.id as string, req.user!.id);
    return sendSuccess(res, refund);
  })
};
