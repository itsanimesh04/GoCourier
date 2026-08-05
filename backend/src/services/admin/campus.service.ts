import { Campus } from '../../models/campus.model';
import { NotFoundError } from '../../utils/errors';

export const campusService = {
  async create(data: {
    name: string;
    city: string;
    cutoff_time: string;
    delivery_time: string;
    is_active?: boolean;
  }) {
    const doc = await Campus.create({
      name: data.name,
      city: data.city,
      cutoff_time: data.cutoff_time,
      delivery_time: data.delivery_time,
      is_active: data.is_active ?? true
    });
    return doc;
  },

  async update(id: string, data: {
    name?: string;
    city?: string;
    cutoff_time?: string;
    delivery_time?: string;
    is_active?: boolean;
  }) {
    const doc = await Campus.findByIdAndUpdate(
      id,
      data,
      { new: true }
    ).exec();

    if (!doc) {
      throw new NotFoundError('Campus not found');
    }

    return doc;
  }
};