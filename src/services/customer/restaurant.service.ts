import { campusRepository } from '../../repositories/campus.repository';
import { menuItemRepository } from '../../repositories/menu-item.repository';
import { restaurantRepository } from '../../repositories/restaurant.repository';
import { BadRequestError, NotFoundError } from '../../utils/errors';

function toCustomerRestaurant(row: Awaited<ReturnType<typeof restaurantRepository.listActiveByCampus>>[number]) {
  return {
    id: row.id,
    campus_id: row.campus_id,
    name: row.name,
    is_active: row.is_active,
    offer_badges: [],
    availability_confidence: null,
    is_promoted: row.manual_priority > 0
  };
}

function toCustomerMenuItem(row: Awaited<ReturnType<typeof menuItemRepository.listByRestaurant>>[number]) {
  return {
    id: row.id,
    restaurant_id: row.restaurant_id,
    name: row.name,
    price: row.price,
    is_veg: row.is_veg,
    is_available: row.is_available
  };
}

export const customerRestaurantService = {
  async list(campusId: string, query?: string) {
    const campus = await campusRepository.findActiveById(campusId);

    if (!campus) {
      throw new NotFoundError('Campus not found');
    }

    const restaurants = await restaurantRepository.listActiveByCampus(campusId, query);
    return restaurants.map(toCustomerRestaurant);
  },

  async getMenu(studentCampusId: string | null, restaurantId: string) {
    if (!studentCampusId) {
      throw new BadRequestError('Campus must be selected');
    }

    const restaurant = await restaurantRepository.findActiveByIdForCampus(restaurantId, studentCampusId);

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    const items = await menuItemRepository.listByRestaurant(restaurantId);

    return {
      restaurant: {
        id: restaurant.id,
        campus_id: restaurant.campus_id,
        name: restaurant.name,
        is_active: restaurant.is_active
      },
      items: items.map(toCustomerMenuItem)
    };
  }
};
