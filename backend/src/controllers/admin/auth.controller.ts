import { adminAuthService } from '../../services/admin/auth.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const adminAuthController = {
  login: asyncHandler(async (req, res) => {
    const result = await adminAuthService.login(req.body.email, req.body.password, res);
    return sendSuccess(res, result);
  }),

  identity: asyncHandler(async (req, res) => {
    const user = await adminAuthService.identity(req.user);
    return sendSuccess(res, user);
  }),

  logout: asyncHandler(async (_req, res) => {
    const result = adminAuthService.logout(res);
    return sendSuccess(res, result);
  })
};
