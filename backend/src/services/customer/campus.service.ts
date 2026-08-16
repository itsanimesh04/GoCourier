import { Campus } from '../../models/campus.model';
import { User } from '../../models/user.model';
import { NotFoundError } from '../../utils/errors';

export const customerCampusService = {
  async listActive() {
    const docs = await Campus.find({ is_active: true }).sort({ name: 1 });
    return docs.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      city: doc.city,
      state: doc.state,
      cutoff_time: doc.cutoff_time,
      delivery_time: doc.delivery_time,
      is_active: doc.is_active,
      created_at: doc.created_at
    }));
  },

  async setDefaultCampus(studentId: string, campusId: string) {
    const campus = await Campus.findOne({ _id: campusId, is_active: true });

    if (!campus) {
      throw new NotFoundError('Campus not found');
    }

    const user = await User.findByIdAndUpdate(
      studentId, 
      { campus_id: campusId },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('Student not found');
    }

    return {
      id: user._id.toString(),
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
      campus_id: user.campus_id?.toString() ?? null
    };
  }
};
