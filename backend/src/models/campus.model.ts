import mongoose, { Schema, model, models } from 'mongoose';

export interface ICampus {
  _id: mongoose.Types.ObjectId;
  name: string;
  city: string;
  cutoff_time: string;
  delivery_time: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const campusSchema = new Schema<ICampus>({
  name: { type: String, required: true, index: true },
  city: { type: String, required: true },
  cutoff_time: { type: String, required: true }, // HH:mm:ss format
  delivery_time: { type: String, required: true }, // HH:mm:ss format
  is_active: { type: Boolean, required: true, default: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

campusSchema.index({ is_active: 1, name: 1 });

export const Campus = models.Campus || model<ICampus>('Campus', campusSchema);