import { campusRepository } from '../../repositories/campus.repository';
import { NotFoundError } from '../../utils/errors';

export const campusService = {
  create(data: Parameters<typeof campusRepository.create>[0]) {
    return campusRepository.create(data);
  },

  async update(id: string, data: Parameters<typeof campusRepository.update>[1]) {
    const campus = await campusRepository.update(id, data);

    if (!campus) {
      throw new NotFoundError('Campus not found');
    }

    return campus;
  }
};
