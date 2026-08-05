import mongoose, { Schema, model, models } from 'mongoose';
import type { UserRole } from '../types/auth';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  phone: string | null;
  email: string | null;
  password_hash: string | null;
  name: string | null;
  role: UserRole;
  campus_id: mongoose.Types.ObjectId | null;
  drop_point: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    phone: { type: String, default: null, sparse: true, unique: true, index: true },
    email: { type: String, default: null, sparse: true, unique: true, index: true, lowercase: true, trim: true },
    password_hash: { type: String, default: null },
    name: { type: String, default: null },
    role: {
      type: String,
      enum: ['student', 'ops', 'admin', 'delivery_agent'],
      required: true,
      default: 'student'
    },
    campus_id: { type: Schema.Types.ObjectId, ref: 'Campus', default: null },
    drop_point: { type: String, default: null },
    is_active: { type: Boolean, required: true, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const User = models.User || model<IUser>('User', userSchema);
