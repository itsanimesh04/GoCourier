import mongoose, { Schema, model, models } from 'mongoose';

export interface IMenuItem {
  _id: mongoose.Types.ObjectId;
  restaurant_id: mongoose.Types.ObjectId;
  name: string;
  price: string;
  is_veg: boolean | null;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

const menuItemSchema = new Schema<IMenuItem>({
  restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  is_veg: { type: Boolean, default: null },
  is_available: { type: Boolean, required: true, default: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

menuItemSchema.index({ restaurant_id: 1, is_available: 1 });

export const MenuItem = models.MenuItem || model<IMenuItem>('MenuItem', menuItemSchema);