import mongoose, { Schema, model, models } from 'mongoose';

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  image_url: string | null;
  image_key: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, index: true },
    image_url: { type: String, default: null },
    image_key: { type: String, default: null },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, required: true, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

categorySchema.index({ is_active: 1, sort_order: 1 });

export const Category = models.Category || model<ICategory>('Category', categorySchema);
