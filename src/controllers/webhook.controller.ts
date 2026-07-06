import { paymentService } from '../services/payment/payment.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const webhookController = {
  payment: asyncHandler(async (req, res) => {
    const result = await paymentService.handleRazorpayWebhook(
      req.rawBody,
      req.get('X-Razorpay-Signature') ?? undefined
    );
    return sendSuccess(res, result);
  }),

  refund: asyncHandler(async (req, res) => {
    const result = await paymentService.handleRazorpayRefundWebhook(
      req.rawBody,
      req.get('X-Razorpay-Signature') ?? undefined
    );
    return sendSuccess(res, result);
  })
};

