import { adminPaymentService } from '../../services/admin/payment.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const adminPaymentController = {
  list: asyncHandler(async (req, res) => {
    const data = await adminPaymentService.list({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      from: typeof req.query.from === 'string' ? req.query.from : undefined,
      to: typeof req.query.to === 'string' ? req.query.to : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    });
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await adminPaymentService.getById(req.params.id as string);
    return sendSuccess(res, data);
  }),

  listRefunds: asyncHandler(async (req, res) => {
    const data = await adminPaymentService.listRefunds({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    });
    return sendSuccess(res, data);
  })
};
