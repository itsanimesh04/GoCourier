import { adminUserService } from '../../services/admin/user.service';
import type { UserRole } from '../../types/auth';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const adminUserController = {
  list: asyncHandler(async (req, res) => {
    const isActive =
      req.query.is_active === undefined ? undefined : req.query.is_active === 'true';
    const data = await adminUserService.list({
      role: typeof req.query.role === 'string' ? (req.query.role as UserRole) : undefined,
      is_active: isActive,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      campus_id: typeof req.query.campus_id === 'string' ? req.query.campus_id : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    });
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await adminUserService.getById(req.params.id as string);
    return sendSuccess(res, data);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await adminUserService.update(req.params.id as string, req.body);
    return sendSuccess(res, data);
  })
};
