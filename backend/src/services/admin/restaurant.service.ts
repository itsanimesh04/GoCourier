import { campusRepository } from '../../repositories/campus.repository';
import { restaurantRepository } from '../../repositories/restaurant.repository';
import { NotFoundError } from '../../utils/errors';

async function ensureCampusExists(campusId: string) {
  const campus = await campusRepository.findById(campusId);
  if (!campus) {
    throw new NotFoundError('Campus not found');
  }
}

export const restaurantService = {
  async create(data: Parameters<typeof restaurantRepository.create>[0]) {
    if (!data.campus_id) {
      throw new NotFoundError('Campus not found');
    }

    await ensureCampusExists(data.campus_id);
    return restaurantRepository.create(data);
  },

  async update(id: string, data: Parameters<typeof restaurantRepository.update>[1]) {
    if (data.campus_id) {
      await ensureCampusExists(data.campus_id);
    }

    const restaurant = await restaurantRepository.update(id, data);

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    return restaurant;
  }
};
