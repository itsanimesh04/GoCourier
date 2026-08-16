import mongoose, { Schema, model, models } from 'mongoose';

export interface IExtraProduct {
  _id: mongoose.Types.ObjectId;
  campus_id: mongoose.Types.ObjectId | null;
  name: string;
  unit: string;
  price: string;
  category: string;
  store_name: string;
  image_url: string | null;
  image_key: string | null;
  available: boolean;
  featured: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

const extraProductSchema = new Schema<IExtraProduct>(
  {
    campus_id: { type: Schema.Types.ObjectId, ref: 'Campus', default: null, index: true },
    name: { type: String, required: true },
    unit: { type: String, default: '1 pc' },
    price: { type: String, required: true },
    category: { type: String, default: 'Snacks' },
    store_name: { type: String, default: 'Campus Cart' },
    image_url: { type: String, default: null },
    image_key: { type: String, default: null },
    available: { type: Boolean, required: true, default: true },
    featured: { type: Boolean, default: false },
    sort_order: { type: Number, default: 0 }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

extraProductSchema.index({ available: 1, featured: -1, sort_order: 1 });

export const ExtraProduct = models.ExtraProduct || model<IExtraProduct>('ExtraProduct', extraProductSchema);
