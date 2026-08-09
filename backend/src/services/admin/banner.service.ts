import { Banner } from '../../models/banner.model';
import { NotFoundError } from '../../utils/errors';
import { s3Service } from '../storage/s3.service';

function mapBanner(doc: InstanceType<typeof Banner>) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    subtitle: doc.subtitle,
    image_url: doc.image_url,
    image_key: doc.image_key,
    cta_label: doc.cta_label,
    cta_href: doc.cta_href,
    sort_order: doc.sort_order,
    is_active: doc.is_active,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

export class BannerService {
  async list(query: { is_active?: boolean } = {}) {
    const filter: Record<string, unknown> = {};
    if (query.is_active !== undefined) filter.is_active = query.is_active;
    const docs = await Banner.find(filter).sort({ sort_order: 1, created_at: -1 }).exec();
    return docs.map(mapBanner);
  }

  async getById(id: string) {
    const doc = await Banner.findById(id).exec();
    if (!doc) throw new NotFoundError('Banner not found');
    return mapBanner(doc);
  }

  async create(data: {
    title: string;
    subtitle?: string;
    image_url?: string | null;
    image_key?: string | null;
    cta_label?: string;
    cta_href?: string;
    sort_order?: number;
    is_active?: boolean;
  }) {
    const doc = await Banner.create({
      title: data.title,
      subtitle: data.subtitle ?? '',
      image_url: data.image_url ?? null,
      image_key: data.image_key ?? null,
      cta_label: data.cta_label ?? '',
      cta_href: data.cta_href ?? '',
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true
    });
    return mapBanner(doc);
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      subtitle: string;
      image_url: string | null;
      image_key: string | null;
      cta_label: string;
      cta_href: string;
      sort_order: number;
      is_active: boolean;
    }>
  ) {
    const existing = await Banner.findById(id).exec();
    if (!existing) throw new NotFoundError('Banner not found');

    if (
      data.image_key !== undefined &&
      existing.image_key &&
      data.image_key !== existing.image_key
    ) {
      await s3Service.delete(existing.image_key).catch(() => undefined);
    }

    const doc = await Banner.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundError('Banner not found');
    return mapBanner(doc);
  }

  async remove(id: string) {
    const doc = await Banner.findById(id).exec();
    if (!doc) throw new NotFoundError('Banner not found');
    if (doc.image_key) {
      await s3Service.delete(doc.image_key).catch(() => undefined);
    }
    await Banner.findByIdAndDelete(id).exec();
    return { deleted: true, id };
  }
}

export const bannerService = new BannerService();
