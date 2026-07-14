import { customerCampusService } from '../../services/customer/campus.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const customerCampusController = {
  list: asyncHandler(async (_req, res) => {
    const campuses = await customerCampusService.listActive();
    return sendSuccess(res, campuses);
  }),

  setDefault: asyncHandler(async (req, res) => {
    const user = await customerCampusService.setDefaultCampus(req.user!.id, req.body.campus_id);
    return sendSuccess(res, user);
  })
};
