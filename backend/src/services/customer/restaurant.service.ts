import mongoose from 'mongoose';
import { Category } from '../../models/category.model';
import { FoodAddon } from '../../models/food-addon.model';
import { MenuItem } from '../../models/menu-item.model';
import { Restaurant } from '../../models/restaurant.model';
import { NotFoundError } from '../../utils/errors';

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
    open_time: doc.open_time,
    close_time: doc.close_time,
    is_open: doc.is_open,
    is_active: doc.is_active,
    is_promoted: doc.manual_priority > 0
  };
}

export const customerRestaurantService = {
  async list(query?: string) {
    const trimmed = query?.trim();
    const filter: Record<string, unknown> = { is_active: true };

    if (trimmed) {
      const pattern = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matchingItemRestaurantIds = await MenuItem.find({
        name: { $regex: pattern, $options: 'i' }
      }).distinct('restaurant_id');

      filter.$or = [
        { name: { $regex: pattern, $options: 'i' } },
        { cuisine: { $regex: pattern, $options: 'i' } },
        { _id: { $in: matchingItemRestaurantIds } }
      ];
    }

    const restaurants = await Restaurant.find(filter).sort({ manual_priority: -1, name: 1 }).exec();
    return restaurants.map(mapRestaurant);
  },

  async getById(id: string) {
    const restaurant = await Restaurant.findOne({ _id: id, is_active: true }).exec();
    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }
    return mapRestaurant(restaurant);
  },

  async getMenu(restaurantId: string) {
    const restaurant = await Restaurant.findOne({ _id: restaurantId, is_active: true }).exec();

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    const items = await MenuItem.find({ restaurant_id: restaurantId, is_available: true })
      .sort({ sort_order: 1, name: 1 })
      .exec();

    const addonIds = [
      ...new Set(
        items.flatMap((item) =>
          ((item.addon_ids ?? []) as mongoose.Types.ObjectId[]).map((addonId) => addonId.toString())
        )
      )
    ];
    const categoryIds = [...new Set(items.map((item) => item.category_id?.toString()).filter(Boolean))] as string[];

    const [addons, categories] = await Promise.all([
      addonIds.length ? FoodAddon.find({ _id: { $in: addonIds }, is_active: true }).exec() : [],
      categoryIds.length ? Category.find({ _id: { $in: categoryIds } }).exec() : []
    ]);

    const addonMap = new Map(
      addons.map((addon) => [
        addon._id.toString(),
        {
          id: addon._id.toString(),
          name: addon.name,
          price: Number(addon.price),
          is_veg: addon.is_veg
        }
      ])
    );
    const categoryMap = new Map(categories.map((category) => [category._id.toString(), category.name]));

    return {
      restaurant: mapRestaurant(restaurant),
      items: items.map((item) => ({
        id: item._id.toString(),
        restaurant_id: item.restaurant_id.toString(),
        category_id: item.category_id?.toString() ?? null,
        category: item.category_id ? categoryMap.get(item.category_id.toString()) ?? null : null,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        original_price: item.original_price ? Number(item.original_price) : null,
        rating: item.rating,
        is_veg: item.is_veg,
        image_url: item.image_url,
        is_available: item.is_available,
        addons: ((item.addon_ids ?? []) as mongoose.Types.ObjectId[])
          .map((addonId: mongoose.Types.ObjectId) => addonMap.get(addonId.toString()))
          .filter((addon): addon is NonNullable<typeof addon> => Boolean(addon))
      }))
    };
  },

  async getMenuItem(id: string) {
    const item = await MenuItem.findById(id).exec();
    if (!item || !item.is_available) {
      throw new NotFoundError('Menu item not found');
    }

    const menu = await this.getMenu(item.restaurant_id.toString());
    const found = menu.items.find((entry) => entry.id === id);
    if (!found) {
      throw new NotFoundError('Menu item not found');
    }

    return { restaurant: menu.restaurant, item: found };
  }
};
