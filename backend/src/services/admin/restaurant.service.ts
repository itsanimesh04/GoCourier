import { Restaurant } from '../../models/restaurant.model';
import { NotFoundError } from '../../utils/errors';
import { s3Service } from '../storage/s3.service';

function mapRestaurant(doc: InstanceType<typeof Restaurant>) {
  return {
    id: doc._id.toString(),
    campus_id: doc.campus_id?.toString() ?? null,
    name: doc.name,
    cuisine: doc.cuisine,
    rating: doc.rating,
    address: doc.address,
    distance_km: doc.distance_km,
    eta_minutes: doc.eta_minutes,
    tags: doc.tags,
    image_url: doc.image_url,
    image_key: doc.image_key,
    open_time: doc.open_time,
    close_time: doc.close_time,
    is_open: doc.is_open,
    is_active: doc.is_active,
    commission_rate: doc.commission_rate,
    manual_priority: doc.manual_priority,
    refund_risk_penalty: doc.refund_risk_penalty,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

export class RestaurantService {
  async list(query: { is_active?: boolean; search?: string } = {}) {
    const filter: Record<string, unknown> = {};
    if (query.is_active !== undefined) filter.is_active = query.is_active;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    const docs = await Restaurant.find(filter).sort({ manual_priority: -1, name: 1 }).exec();
    return docs.map(mapRestaurant);
  }

  async getById(id: string) {
    const doc = await Restaurant.findById(id).exec();
    if (!doc) throw new NotFoundError('Restaurant not found');
    return mapRestaurant(doc);
  }

  async create(data: {
    name: string;
    cuisine?: string;
    rating?: number;
    address?: string;
    distance_km?: number;
    eta_minutes?: number;
    tags?: string[];
    image_url?: string | null;
    image_key?: string | null;
    open_time?: string | null;
    close_time?: string | null;
    is_open?: boolean;
    is_active?: boolean;
    commission_rate?: string;
    manual_priority?: number;
    refund_risk_penalty?: string;
  }) {
    const doc = await Restaurant.create({
      campus_id: null,
      name: data.name,
      cuisine: data.cuisine ?? '',
      rating: data.rating ?? 0,
      address: data.address ?? '',
      distance_km: data.distance_km ?? 0,
      eta_minutes: data.eta_minutes ?? 0,
      tags: data.tags ?? [],
      image_url: data.image_url ?? null,
      image_key: data.image_key ?? null,
      open_time: data.open_time ?? null,
      close_time: data.close_time ?? null,
      is_open: data.is_open ?? true,
      is_active: data.is_active ?? true,
      commission_rate: data.commission_rate ?? '0.00',
      manual_priority: data.manual_priority ?? 0,
      refund_risk_penalty: data.refund_risk_penalty ?? '0.00'
    });
    return mapRestaurant(doc);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      cuisine: string;
      rating: number;
      address: string;
      distance_km: number;
      eta_minutes: number;
      tags: string[];
      image_url: string | null;
      image_key: string | null;
      open_time: string | null;
      close_time: string | null;
      is_open: boolean;
      is_active: boolean;
      commission_rate: string;
      manual_priority: number;
      refund_risk_penalty: string;
    }>
  ) {
    const existing = await Restaurant.findById(id).exec();
    if (!existing) throw new NotFoundError('Restaurant not found');

    if (
      data.image_key !== undefined &&
      existing.image_key &&
      data.image_key !== existing.image_key
    ) {
      await s3Service.delete(existing.image_key).catch(() => undefined);
    }

    const doc = await Restaurant.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundError('Restaurant not found');
    return mapRestaurant(doc);
  }

  async softDelete(id: string) {
    return this.update(id, { is_active: false });
  }
}

export const restaurantService = new RestaurantService();
