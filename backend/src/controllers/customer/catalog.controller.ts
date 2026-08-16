import { customerCatalogService } from '../../services/customer/catalog.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const customerCatalogController = {
  banners: asyncHandler(async (_req, res) => {
    return sendSuccess(res, await customerCatalogService.listBanners());
  }),

  categories: asyncHandler(async (_req, res) => {
    return sendSuccess(res, await customerCatalogService.listCategories());
  }),

  config: asyncHandler(async (_req, res) => {
    return sendSuccess(res, await customerCatalogService.getConfig());
  }),

  extras: asyncHandler(async (req, res) => {
    const campusId = typeof req.query.campus_id === 'string' ? req.query.campus_id : undefined;
    return sendSuccess(res, await customerCatalogService.listExtras(campusId));
  })
};
