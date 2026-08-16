import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const authController = {
  signup: asyncHandler(async (req, res) => {
    const result = await authService.signup(req.body, res);
    return sendSuccess(res, result, 201);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body.identifier, req.body.password, res);
    return sendSuccess(res, result);
  }),

  logout: asyncHandler(async (_req, res) => {
    const result = authService.logout(res);
    return sendSuccess(res, result);
  }),

  me: asyncHandler(async (req, res) => {
    const result = await authService.identity(req.user!.id);
    return sendSuccess(res, result);
  }),

  requestOtp: asyncHandler(async (req, res) => {
    const result = await authService.requestOtp(req.body.phone);
    return sendSuccess(res, result, 201);
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const result = await authService.verifyOtp(req.body.phone, req.body.otp_code, res);
    return sendSuccess(res, {
      token: result.token,
      user: result.user
    });
  })
};
