import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const authController = {
  requestOtp: asyncHandler(async (req, res) => {
    const result = await authService.requestOtp(req.body.phone);
    return sendSuccess(res, result, 201);
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const result = await authService.verifyOtp(req.body.phone, req.body.otp_code);
    return sendSuccess(res, result);
  })
};
