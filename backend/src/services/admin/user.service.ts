import { User } from '../../models/user.model';
import type { UserRole } from '../../types/auth';
import { NotFoundError } from '../../utils/errors';

function mapUser(doc: InstanceType<typeof User>) {
  return {
    id: doc._id.toString(),
    phone: doc.phone,
    email: doc.email,
    name: doc.name,
    role: doc.role,
    campus_id: doc.campus_id?.toString() ?? null,
    drop_point: doc.drop_point,
    is_active: doc.is_active,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

export class AdminUserService {
  async list(query: {
    role?: UserRole;
    is_active?: boolean;
    search?: string;
    campus_id?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const filter: Record<string, unknown> = {};
    if (query.role) filter.role = query.role;
    if (query.is_active !== undefined) filter.is_active = query.is_active;
    if (query.campus_id) filter.campus_id = query.campus_id;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } }
      ];
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 50));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      User.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      User.countDocuments(filter)
    ]);

    return {
      items: docs.map(mapUser),
      total,
      page,
      limit
    };
  }

  async getById(id: string) {
    const doc = await User.findById(id).exec();
    if (!doc) throw new NotFoundError('User not found');
    return mapUser(doc);
  }

  async update(
    id: string,
    data: Partial<{
      name: string | null;
      is_active: boolean;
      role: UserRole;
      campus_id: string | null;
      drop_point: string | null;
    }>
  ) {
    const doc = await User.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundError('User not found');
    return mapUser(doc);
  }
}

export const adminUserService = new AdminUserService();
