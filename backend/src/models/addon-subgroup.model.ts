import mongoose, { Schema, model, models } from 'mongoose';

export interface IAddonSubGroup {
  _id: mongoose.Types.ObjectId;
  group_id: mongoose.Types.ObjectId;
  name: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

const addonSubGroupSchema = new Schema<IAddonSubGroup>(
  {
    group_id: { type: Schema.Types.ObjectId, ref: 'AddonGroup', required: true, index: true },
    name: { type: String, default: '' },
    sort_order: { type: Number, default: 0 }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

addonSubGroupSchema.index({ group_id: 1, sort_order: 1 });

export const AddonSubGroup =
  models.AddonSubGroup || model<IAddonSubGroup>('AddonSubGroup', addonSubGroupSchema);
