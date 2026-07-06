import { campusService } from '../../services/admin/campus.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const campusController = {
  create: asyncHandler(async (req, res) => {
    const campus = await campusService.create(req.body);
    return sendSuccess(res, campus, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const campus = await campusService.update(req.params.id as string, req.body);
    return sendSuccess(res, campus);
  })
};
