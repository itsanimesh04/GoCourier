import mongoose, { Schema, model, models } from 'mongoose';

export interface IFoodAddon {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: string;
  is_veg: boolean | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const foodAddonSchema = new Schema<IFoodAddon>(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    is_veg: { type: Boolean, default: null },
    is_active: { type: Boolean, required: true, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const FoodAddon = models.FoodAddon || model<IFoodAddon>('FoodAddon', foodAddonSchema);
