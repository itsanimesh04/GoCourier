import { menuItemRepository } from '../../repositories/menu-item.repository';
import { restaurantRepository } from '../../repositories/restaurant.repository';
import { NotFoundError } from '../../utils/errors';

async function ensureRestaurantExists(restaurantId: string) {
  const restaurant = await restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant not found');
  }
  return restaurant;
}

export const menuItemService = {
  async create(restaurantId: string, data: Omit<Parameters<typeof menuItemRepository.create>[0], 'restaurant_id'>) {
    await ensureRestaurantExists(restaurantId);
    return menuItemRepository.create({ ...data, restaurant_id: restaurantId });
  },

  async update(id: string, data: Parameters<typeof menuItemRepository.update>[1]) {
    const menuItem = await menuItemRepository.update(id, data);

    if (!menuItem) {
      throw new NotFoundError('Menu item not found');
    }

    await ensureRestaurantExists(menuItem.restaurant_id);
    return menuItem;
  }
};
