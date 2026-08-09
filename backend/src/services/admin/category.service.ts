import { Category } from '../../models/category.model';
import { NotFoundError } from '../../utils/errors';
import { s3Service } from '../storage/s3.service';

function mapCategory(doc: InstanceType<typeof Category>) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    image_url: doc.image_url,
    image_key: doc.image_key,
    sort_order: doc.sort_order,
    is_active: doc.is_active,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

export class CategoryService {
  async list(query: { is_active?: boolean } = {}) {
    const filter: Record<string, unknown> = {};
    if (query.is_active !== undefined) filter.is_active = query.is_active;
    const docs = await Category.find(filter).sort({ sort_order: 1, name: 1 }).exec();
    return docs.map(mapCategory);
  }

  async getById(id: string) {
    const doc = await Category.findById(id).exec();
    if (!doc) throw new NotFoundError('Category not found');
    return mapCategory(doc);
  }

  async create(data: {
    name: string;
    image_url?: string | null;
    image_key?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }) {
    const doc = await Category.create({
      name: data.name,
      image_url: data.image_url ?? null,
      image_key: data.image_key ?? null,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true
    });
    return mapCategory(doc);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      image_url: string | null;
      image_key: string | null;
      sort_order: number;
      is_active: boolean;
    }>
  ) {
    const existing = await Category.findById(id).exec();
    if (!existing) throw new NotFoundError('Category not found');

    if (
      data.image_key !== undefined &&
      existing.image_key &&
      data.image_key !== existing.image_key
    ) {
      await s3Service.delete(existing.image_key).catch(() => undefined);
    }

    const doc = await Category.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundError('Category not found');
    return mapCategory(doc);
  }

  async remove(id: string) {
    const doc = await Category.findById(id).exec();
    if (!doc) throw new NotFoundError('Category not found');
    if (doc.image_key) {
      await s3Service.delete(doc.image_key).catch(() => undefined);
    }
    await Category.findByIdAndDelete(id).exec();
    return { deleted: true, id };
  }
}

export const categoryService = new CategoryService();
