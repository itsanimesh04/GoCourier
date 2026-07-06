import { campusRepository } from '../../repositories/campus.repository';
import { userRepository } from '../../repositories/user.repository';
import { NotFoundError } from '../../utils/errors';

export const customerCampusService = {
  listActive() {
    return campusRepository.listActive();
  },

  async setDefaultCampus(studentId: string, campusId: string) {
    const campus = await campusRepository.findActiveById(campusId);

    if (!campus) {
      throw new NotFoundError('Campus not found');
    }

    const user = await userRepository.updateCampus(studentId, campusId);

    if (!user) {
      throw new NotFoundError('Student not found');
    }

    return user;
  }
};
