import mongoose, { Schema, model, models } from 'mongoose';

export interface IFoodAddon {
  _id: mongoose.Types.ObjectId;
  subgroup_id: mongoose.Types.ObjectId | null;
  name: string;
  price: string;
  is_veg: boolean | null;
  image_url: string | null;
  image_key: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const foodAddonSchema = new Schema<IFoodAddon>(
  {
    subgroup_id: { type: Schema.Types.ObjectId, ref: 'AddonSubGroup', default: null, index: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    is_veg: { type: Boolean, default: null },
    image_url: { type: String, default: null },
    image_key: { type: String, default: null },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, required: true, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

foodAddonSchema.index({ subgroup_id: 1, sort_order: 1 });

export const FoodAddon = models.FoodAddon || model<IFoodAddon>('FoodAddon', foodAddonSchema);
