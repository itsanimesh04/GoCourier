import { campusService } from '../../services/admin/campus.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const campusController = {
  create: asyncHandler(async (req, res) => {
    const campus = await campusService.create(req.body);
    return sendSuccess(res, {
      id: campus._id.toString(),
      name: campus.name,
      city: campus.city,
      cutoff_time: campus.cutoff_time,
      delivery_time: campus.delivery_time,
      is_active: campus.is_active,
      created_at: campus.created_at
    }, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const campus = await campusService.update(req.params.id as string, req.body);
    return sendSuccess(res, {
      id: campus._id.toString(),
      name: campus.name,
      city: campus.city,
      cutoff_time: campus.cutoff_time,
      delivery_time: campus.delivery_time,
      is_active: campus.is_active,
      created_at: campus.created_at
    });
  })
};
