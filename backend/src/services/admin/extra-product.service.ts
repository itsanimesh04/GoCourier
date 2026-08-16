import { ExtraProduct } from '../../models/extra-product.model';
import { Campus } from '../../models/campus.model';
import { NotFoundError } from '../../utils/errors';
import { s3Service } from '../storage/s3.service';

export function mapExtraProduct(doc: InstanceType<typeof ExtraProduct>) {
  return {
    id: doc._id.toString(),
    campus_id: doc.campus_id?.toString() ?? null,
    name: doc.name,
    unit: doc.unit,
    price: doc.price,
    category: doc.category,
    store_name: doc.store_name,
    image_url: doc.image_url,
    image_key: doc.image_key,
    available: doc.available,
    featured: doc.featured,
    sort_order: doc.sort_order,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

export class ExtraProductService {
  async list(query: { campus_id?: string; available?: boolean; search?: string } = {}) {
    const filter: Record<string, unknown> = {};
    if (query.campus_id) {
      filter.$or = [{ campus_id: query.campus_id }, { campus_id: null }];
    }
    if (query.available !== undefined) filter.available = query.available;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    const docs = await ExtraProduct.find(filter).sort({ featured: -1, sort_order: 1, name: 1 }).exec();
    return docs.map(mapExtraProduct);
  }

  async getById(id: string) {
    const doc = await ExtraProduct.findById(id).exec();
    if (!doc) throw new NotFoundError('Extra product not found');
    return mapExtraProduct(doc);
  }

  async create(data: {
    campus_id?: string | null;
    name: string;
    unit?: string;
    price: string;
    category?: string;
    store_name?: string;
    image_url?: string | null;
    image_key?: string | null;
    available?: boolean;
    featured?: boolean;
    sort_order?: number;
  }) {
    if (data.campus_id) {
      const campus = await Campus.findById(data.campus_id);
      if (!campus) throw new NotFoundError('Campus not found');
    }

    const doc = await ExtraProduct.create({
      campus_id: data.campus_id ?? null,
      name: data.name,
      unit: data.unit ?? '1 pc',
      price: data.price,
      category: data.category ?? 'Snacks',
      store_name: data.store_name ?? 'Campus Cart',
      image_url: data.image_url ?? null,
      image_key: data.image_key ?? null,
      available: data.available ?? true,
      featured: data.featured ?? false,
      sort_order: data.sort_order ?? 0
    });
    return mapExtraProduct(doc);
  }

  async update(
    id: string,
    data: Partial<{
      campus_id: string | null;
      name: string;
      unit: string;
      price: string;
      category: string;
      store_name: string;
      image_url: string | null;
      image_key: string | null;
      available: boolean;
      featured: boolean;
      sort_order: number;
    }>
  ) {
    if (data.campus_id) {
      const campus = await Campus.findById(data.campus_id);
      if (!campus) throw new NotFoundError('Campus not found');
    }

    const existing = await ExtraProduct.findById(id).exec();
    if (!existing) throw new NotFoundError('Extra product not found');

    if (
      data.image_key !== undefined &&
      existing.image_key &&
      data.image_key !== existing.image_key
    ) {
      await s3Service.delete(existing.image_key).catch(() => undefined);
    }

    const doc = await ExtraProduct.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundError('Extra product not found');
    return mapExtraProduct(doc);
  }

  async remove(id: string) {
    return this.update(id, { available: false });
  }
}

export const extraProductService = new ExtraProductService();
