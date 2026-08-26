import mongoose, { Schema, model, models } from 'mongoose';

export interface IAddonGroup {
  _id: mongoose.Types.ObjectId;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

const addonGroupSchema = new Schema<IAddonGroup>(
  {
    name: { type: String, required: true },
    is_active: { type: Boolean, required: true, default: true },
    sort_order: { type: Number, default: 0 }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

addonGroupSchema.index({ sort_order: 1, name: 1 });

export const AddonGroup = models.AddonGroup || model<IAddonGroup>('AddonGroup', addonGroupSchema);
