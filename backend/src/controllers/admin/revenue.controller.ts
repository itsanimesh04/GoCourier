import { revenueService } from '../../services/admin/revenue.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const revenueController = {
  summary: asyncHandler(async (req, res) => {
    const data = await revenueService.summary({
      from: typeof req.query.from === 'string' ? req.query.from : undefined,
      to: typeof req.query.to === 'string' ? req.query.to : undefined,
      campus_id: typeof req.query.campus_id === 'string' ? req.query.campus_id : undefined
    });
    return sendSuccess(res, data);
  })
};
