import { MenuItem } from '../../models/menu-item.model';
import { Restaurant } from '../../models/restaurant.model';
import { NotFoundError } from '../../utils/errors';

async function ensureRestaurantExists(restaurantId: string) {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant not found');
  }
  return restaurant;
}

export const menuItemService = {
  async create(restaurantId: string, data: {
    name: string;
    price: string;
    is_veg?: boolean | null;
    is_available?: boolean;
  }) {
    await ensureRestaurantExists(restaurantId);
    
    const doc = await MenuItem.create({
      restaurant_id: restaurantId,
      name: data.name,
      price: data.price,
      is_veg: data.is_veg ?? null,
      is_available: data.is_available ?? true
    });

    return {
      id: doc._id.toString(),
      restaurant_id: doc.restaurant_id.toString(),
      name: doc.name,
      price: doc.price,
      is_veg: doc.is_veg,
      is_available: doc.is_available,
      created_at: doc.created_at
    };
  },

  async update(id: string, data: {
    name?: string;
    price?: string;
    is_veg?: boolean | null;
    is_available?: boolean;
  }) {
    const menuItem = await MenuItem.findByIdAndUpdate(id, data, { new: true }).exec();

    if (!menuItem) {
      throw new NotFoundError('Menu item not found');
    }

    await ensureRestaurantExists(menuItem.restaurant_id.toString());
    
    return {
      id: menuItem._id.toString(),
      restaurant_id: menuItem.restaurant_id.toString(),
      name: menuItem.name,
      price: menuItem.price,
      is_veg: menuItem.is_veg,
      is_available: menuItem.is_available,
      created_at: menuItem.created_at
    };
  }
};