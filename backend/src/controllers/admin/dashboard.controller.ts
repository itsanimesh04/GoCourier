import { dashboardService } from '../../services/admin/dashboard.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const dashboardController = {
  stats: asyncHandler(async (_req, res) => {
    const data = await dashboardService.getStats();
    return sendSuccess(res, data);
  })
};
