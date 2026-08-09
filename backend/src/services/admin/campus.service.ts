import { Campus } from '../../models/campus.model';
import { NotFoundError } from '../../utils/errors';

function mapCampus(doc: InstanceType<typeof Campus>) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    city: doc.city,
    state: doc.state,
    cutoff_time: doc.cutoff_time,
    delivery_time: doc.delivery_time,
    is_active: doc.is_active,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

export class CampusService {
  async list(query: { is_active?: boolean; search?: string } = {}) {
    const filter: Record<string, unknown> = {};
    if (query.is_active !== undefined) filter.is_active = query.is_active;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { city: { $regex: query.search, $options: 'i' } }
      ];
    }
    const docs = await Campus.find(filter).sort({ name: 1 }).exec();
    return docs.map(mapCampus);
  }

  async getById(id: string) {
    const doc = await Campus.findById(id).exec();
    if (!doc) throw new NotFoundError('Campus not found');
    return mapCampus(doc);
  }

  async create(data: {
    name: string;
    city: string;
    state?: string | null;
    cutoff_time: string;
    delivery_time: string;
    is_active?: boolean;
  }) {
    const doc = await Campus.create({
      name: data.name,
      city: data.city,
      state: data.state ?? null,
      cutoff_time: data.cutoff_time,
      delivery_time: data.delivery_time,
      is_active: data.is_active ?? true
    });
    return mapCampus(doc);
  }

  async update(
    id: string,
    data: {
      name?: string;
      city?: string;
      state?: string | null;
      cutoff_time?: string;
      delivery_time?: string;
      is_active?: boolean;
    }
  ) {
    const doc = await Campus.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundError('Campus not found');
    return mapCampus(doc);
  }

  async softDelete(id: string) {
    const doc = await Campus.findByIdAndUpdate(id, { is_active: false }, { new: true }).exec();
    if (!doc) throw new NotFoundError('Campus not found');
    return mapCampus(doc);
  }
}

export const campusService = new CampusService();
