import { User, type IUser } from '../models/user.model';
import type { UserRole } from '../types/auth';

export interface UserRow {
  id: string;
  phone: string | null;
  email: string | null;
  password_hash: string | null;
  name: string | null;
  role: UserRole;
  campus_id: string | null;
  drop_point: string | null;
  is_active: boolean;
  created_at: Date;
}

function toUserRow(doc: IUser): UserRow {
  return {
    id: doc._id.toString(),
    phone: doc.phone,
    email: doc.email,
    password_hash: doc.password_hash,
    name: doc.name,
    role: doc.role,
    campus_id: doc.campus_id?.toString() ?? null,
    drop_point: doc.drop_point,
    is_active: doc.is_active,
    created_at: doc.created_at
  };
}

export const userRepository = {
  async findById(id: string): Promise<UserRow | null> {
    const doc = await User.findById(id).exec();
    return doc ? toUserRow(doc) : null;
  },

  async findByPhone(phone: string): Promise<UserRow | null> {
    const doc = await User.findOne({ phone }).exec();
    return doc ? toUserRow(doc) : null;
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    const doc = await User.findOne({ email: email.toLowerCase().trim() }).exec();
    return doc ? toUserRow(doc) : null;
  },

  async findByEmailOrPhone(identifier: string): Promise<UserRow | null> {
    const trimmed = identifier.trim();
    const looksLikeEmail = trimmed.includes('@');
    if (looksLikeEmail) {
      return this.findByEmail(trimmed);
    }
    return this.findByPhone(trimmed);
  },

  async createStudent(data: {
    name: string;
    password_hash: string;
    email?: string | null;
    phone?: string | null;
  }): Promise<UserRow> {
    const doc = await User.create({
      name: data.name,
      password_hash: data.password_hash,
      email: data.email ? data.email.toLowerCase().trim() : null,
      phone: data.phone ?? null,
      role: 'student',
      campus_id: null
    });
    return toUserRow(doc);
  },

  async createStudentByPhone(phone: string): Promise<UserRow> {
    const doc = await User.create({ phone, role: 'student', campus_id: null });
    return toUserRow(doc);
  },

  async findOrCreateStudentByPhone(_client: unknown, phone: string): Promise<UserRow> {
    const doc = await User.findOneAndUpdate(
      { phone },
      { $setOnInsert: { phone, role: 'student', campus_id: null } },
      { upsert: true, new: true }
    ).exec();
    return toUserRow(doc!);
  },

  async updateCampus(id: string, campusId: string): Promise<UserRow | null> {
    const doc = await User.findOneAndUpdate(
      { _id: id, role: 'student' },
      { campus_id: campusId },
      { new: true }
    ).exec();
    return doc ? toUserRow(doc) : null;
  },

  async findByIdWithPhone(id: string): Promise<UserRow | null> {
    const doc = await User.findById(id).exec();
    return doc ? toUserRow(doc) : null;
  }
};
