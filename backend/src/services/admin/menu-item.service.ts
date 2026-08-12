import { MenuItem } from '../../models/menu-item.model';
import { Restaurant } from '../../models/restaurant.model';
import { FoodAddon } from '../../models/food-addon.model';
import { NotFoundError } from '../../utils/errors';
import { s3Service } from '../storage/s3.service';

function mapMenuItem(doc: InstanceType<typeof MenuItem>) {
  return {
    id: doc._id.toString(),
    restaurant_id: doc.restaurant_id.toString(),
    category_id: doc.category_id?.toString() ?? null,
    name: doc.name,
    description: doc.description,
    price: doc.price,
    original_price: doc.original_price,
    rating: doc.rating,
    is_veg: doc.is_veg,
    image_url: doc.image_url,
    image_key: doc.image_key,
    is_available: doc.is_available,
    sort_order: doc.sort_order,
    addon_ids: (doc.addon_ids ?? []).map((id: { toString(): string }) => id.toString()),
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

async function ensureRestaurantExists(restaurantId: string) {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new NotFoundError('Restaurant not found');
}

export class MenuItemService {
  async list(query: {
    restaurant_id?: string;
    category_id?: string;
    is_available?: boolean;
    search?: string;
  } = {}) {
    const filter: Record<string, unknown> = {};
    if (query.restaurant_id) filter.restaurant_id = query.restaurant_id;
    if (query.category_id) filter.category_id = query.category_id;
    if (query.is_available !== undefined) filter.is_available = query.is_available;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    const docs = await MenuItem.find(filter).sort({ sort_order: 1, name: 1 }).exec();
    return docs.map(mapMenuItem);
  }

  async getById(id: string) {
    const doc = await MenuItem.findById(id).exec();
    if (!doc) throw new NotFoundError('Menu item not found');
    return mapMenuItem(doc);
  }

  async create(
    restaurantId: string,
    data: {
      name: string;
      price: string;
      description?: string;
      original_price?: string | null;
      rating?: number;
      is_veg?: boolean | null;
      is_available?: boolean;
      category_id?: string | null;
      image_url?: string | null;
      image_key?: string | null;
      sort_order?: number;
      addon_ids?: string[];
    }
  ) {
    await ensureRestaurantExists(restaurantId);
    const doc = await MenuItem.create({
      restaurant_id: restaurantId,
      name: data.name,
      price: data.price,
      description: data.description ?? '',
      original_price: data.original_price ?? null,
      rating: data.rating ?? 0,
      is_veg: data.is_veg ?? null,
      is_available: data.is_available ?? true,
      category_id: data.category_id ?? null,
      image_url: data.image_url ?? null,
      image_key: data.image_key ?? null,
      sort_order: data.sort_order ?? 0,
      addon_ids: data.addon_ids ?? []
    });
    return mapMenuItem(doc);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      price: string;
      description: string;
      original_price: string | null;
      rating: number;
      is_veg: boolean | null;
      is_available: boolean;
      category_id: string | null;
      image_url: string | null;
      image_key: string | null;
      sort_order: number;
      addon_ids: string[];
      restaurant_id: string;
    }>
  ) {
    if (data.restaurant_id) await ensureRestaurantExists(data.restaurant_id);
    const existing = await MenuItem.findById(id).exec();
    if (!existing) throw new NotFoundError('Menu item not found');

    if (
      data.image_key !== undefined &&
      existing.image_key &&
      data.image_key !== existing.image_key
    ) {
      await s3Service.delete(existing.image_key).catch(() => undefined);
    }

    const doc = await MenuItem.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundError('Menu item not found');
    return mapMenuItem(doc);
  }

  async softDelete(id: string) {
    return this.update(id, { is_available: false });
  }

  async listAddons() {
    const docs = await FoodAddon.find({ is_active: true }).sort({ name: 1 }).exec();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      price: doc.price,
      is_veg: doc.is_veg,
      is_active: doc.is_active,
      created_at: doc.created_at
    }));
  }

  async createAddon(data: { name: string; price: string; is_veg?: boolean | null }) {
    const doc = await FoodAddon.create({
      name: data.name,
      price: data.price,
      is_veg: data.is_veg ?? null,
      is_active: true
    });
    return {
      id: doc._id.toString(),
      name: doc.name,
      price: doc.price,
      is_veg: doc.is_veg,
      is_active: doc.is_active,
      created_at: doc.created_at
    };
  }

  async updateAddon(
    id: string,
    data: Partial<{ name: string; price: string; is_veg: boolean | null; is_active: boolean }>
  ) {
    const doc = await FoodAddon.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundError('Addon not found');
    return {
      id: doc._id.toString(),
      name: doc.name,
      price: doc.price,
      is_veg: doc.is_veg,
      is_active: doc.is_active,
      created_at: doc.created_at
    };
  }
}

export const menuItemService = new MenuItemService();
