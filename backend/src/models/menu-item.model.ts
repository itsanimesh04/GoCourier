import mongoose, { Schema, model, models } from 'mongoose';

export interface IMenuItem {
  _id: mongoose.Types.ObjectId;
  restaurant_id: mongoose.Types.ObjectId;
  category_id: mongoose.Types.ObjectId | null;
  name: string;
  description: string;
  price: string;
  original_price: string | null;
  rating: number;
  is_veg: boolean | null;
  image_url: string | null;
  image_key: string | null;
  is_available: boolean;
  sort_order: number;
  addon_ids: mongoose.Types.ObjectId[];
  created_at: Date;
  updated_at: Date;
}

const menuItemSchema = new Schema<IMenuItem>({
  restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: String, required: true },
  original_price: { type: String, default: null },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  is_veg: { type: Boolean, default: null },
  image_url: { type: String, default: null },
  image_key: { type: String, default: null },
  is_available: { type: Boolean, required: true, default: true },
  sort_order: { type: Number, default: 0 },
  addon_ids: [{ type: Schema.Types.ObjectId, ref: 'FoodAddon' }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

menuItemSchema.index({ restaurant_id: 1, is_available: 1 });
menuItemSchema.index({ category_id: 1, sort_order: 1 });

export const MenuItem = models.MenuItem || model<IMenuItem>('MenuItem', menuItemSchema);
