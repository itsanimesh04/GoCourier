import mongoose, { Schema, model, models } from 'mongoose';

export interface IRestaurant {
  _id: mongoose.Types.ObjectId;
  campus_id: mongoose.Types.ObjectId;
  name: string;
  is_active: boolean;
  commission_rate: string;
  manual_priority: number;
  refund_risk_penalty: string;
  created_at: Date;
  updated_at: Date;
}

const restaurantSchema = new Schema<IRestaurant>({
  campus_id: { type: Schema.Types.ObjectId, ref: 'Campus', required: true, index: true },
  name: { type: String, required: true },
  is_active: { type: Boolean, required: true, default: true },
  commission_rate: { type: String, default: '0.00' },
  manual_priority: { type: Number, default: 0 },
  refund_risk_penalty: { type: String, default: '0.00' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

restaurantSchema.index({ campus_id: 1, is_active: 1, name: 1 });

export const Restaurant = models.Restaurant || model<IRestaurant>('Restaurant', restaurantSchema);