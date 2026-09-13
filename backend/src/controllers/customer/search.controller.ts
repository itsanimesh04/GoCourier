import { customerSearchService } from '../../services/customer/search.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const customerSearchController = {
  search: asyncHandler(async (req, res) => {
    const q = (req.query.q as string) || '';
    const mode = req.query.mode as 'food' | 'extras' | undefined;
    const campusId = req.query.campus_id as string | undefined;

    const results = await customerSearchService.search(q, mode, campusId);
    return sendSuccess(res, results);
  })
};
