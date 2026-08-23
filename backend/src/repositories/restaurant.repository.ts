import { Restaurant, type IRestaurant } from '../models/restaurant.model';
import { MenuItem } from '../models/menu-item.model';

export interface RestaurantRow {
  id: string;
  campus_id: string | null;
  name: string;
  is_active: boolean;
  commission_rate: string;
  manual_priority: number;
  refund_risk_penalty: string;
  created_at: Date;
}

export interface CustomerRestaurantRow {
  id: string;
  campus_id: string | null;
  name: string;
  is_active: boolean;
  manual_priority: number;
  created_at: Date;
  relevance_sort: number;
}

function toRestaurantRow(doc: IRestaurant): RestaurantRow {
  return {
    id: doc._id.toString(),
    campus_id: doc.campus_id?.toString() ?? null,
    name: doc.name,
    is_active: doc.is_active,
    commission_rate: doc.commission_rate,
    manual_priority: doc.manual_priority,
    refund_risk_penalty: doc.refund_risk_penalty,
    created_at: doc.created_at
  };
}

export const restaurantRepository = {
  async findById(id: string): Promise<RestaurantRow | null> {
    const doc = await Restaurant.findById(id).exec();
    return doc ? toRestaurantRow(doc) : null;
  },

  async findActiveById(id: string): Promise<RestaurantRow | null> {
    const doc = await Restaurant.findOne({ _id: id, is_active: true }).exec();
    return doc ? toRestaurantRow(doc) : null;
  },

  async listActive(query?: string): Promise<CustomerRestaurantRow[]> {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
      const docs = await Restaurant.find({ is_active: true }).sort({ name: 1 }).exec();
      return docs.map(doc => ({
        id: doc._id.toString(),
        campus_id: doc.campus_id?.toString() ?? null,
        name: doc.name,
        is_active: doc.is_active,
        manual_priority: doc.manual_priority,
        created_at: doc.created_at,
        relevance_sort: 0
      }));
    }

    const pattern = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const docs = await Restaurant.find({
      is_active: true,
      $or: [
        { name: { $regex: pattern, $options: 'i' } },
        { _id: { $in: await MenuItem.find({ name: { $regex: pattern, $options: 'i' } }).distinct('restaurant_id') } }
      ]
    }).sort({ name: 1 }).exec();

    return docs.map(doc => ({
      id: doc._id.toString(),
      campus_id: doc.campus_id?.toString() ?? null,
      name: doc.name,
      is_active: doc.is_active,
      manual_priority: doc.manual_priority,
      created_at: doc.created_at,
      relevance_sort: doc.name.toLowerCase().includes(trimmedQuery.toLowerCase()) ? 0 : 1
    }));
  },

  async create(data: Partial<RestaurantRow>): Promise<RestaurantRow> {
    const doc = await Restaurant.create({
      campus_id: data.campus_id ?? null,
      name: data.name,
      is_active: data.is_active ?? true,
      commission_rate: data.commission_rate ?? '0.00',
      manual_priority: data.manual_priority ?? 0,
      refund_risk_penalty: data.refund_risk_penalty ?? '0.00'
    });
    return toRestaurantRow(doc);
  },

  async update(id: string, data: Partial<RestaurantRow>): Promise<RestaurantRow | null> {
    const updateData: Record<string, unknown> = {};
    const columns = ['campus_id', 'name', 'is_active', 'commission_rate', 'manual_priority', 'refund_risk_penalty'];
    for (const column of columns) {
      if (data[column as keyof RestaurantRow] !== undefined) {
        updateData[column] = data[column as keyof RestaurantRow];
      }
    }
    const doc = await Restaurant.findByIdAndUpdate(id, updateData, { new: true }).exec();
    return doc ? toRestaurantRow(doc) : null;
  }
};
