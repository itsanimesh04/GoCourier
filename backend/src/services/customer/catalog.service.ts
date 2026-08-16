import { Banner } from '../../models/banner.model';
import { Category } from '../../models/category.model';
import { adminConfigService } from '../admin/config.service';
import { extraProductService } from '../admin/extra-product.service';

export const customerCatalogService = {
  async listBanners() {
    const docs = await Banner.find({ is_active: true }).sort({ sort_order: 1, created_at: -1 }).exec();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      subtitle: doc.subtitle,
      image_url: doc.image_url,
      cta_label: doc.cta_label,
      cta_href: doc.cta_href,
      sort_order: doc.sort_order
    }));
  },

  async listCategories() {
    const docs = await Category.find({ is_active: true }).sort({ sort_order: 1, name: 1 }).exec();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      image_url: doc.image_url,
      sort_order: doc.sort_order
    }));
  },

  async getConfig() {
    return adminConfigService.get();
  },

  async listExtras(campusId?: string) {
    return extraProductService.list({
      campus_id: campusId,
      available: true
    });
  }
};
