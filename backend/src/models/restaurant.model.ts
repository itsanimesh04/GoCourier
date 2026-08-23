import mongoose, { Schema, model, models } from 'mongoose';

export interface IRestaurant {
  _id: mongoose.Types.ObjectId;
  campus_id: mongoose.Types.ObjectId | null;
  name: string;
  cuisine: string;
  rating: number;
  address: string;
  distance_km: number;
  eta_minutes: number;
  tags: string[];
  image_url: string | null;
  image_key: string | null;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
  is_active: boolean;
  commission_rate: string;
  manual_priority: number;
  refund_risk_penalty: string;
  created_at: Date;
  updated_at: Date;
}

const restaurantSchema = new Schema<IRestaurant>({
  campus_id: { type: Schema.Types.ObjectId, ref: 'Campus', default: null, index: true },
  name: { type: String, required: true },
  cuisine: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  address: { type: String, default: '' },
  distance_km: { type: Number, default: 0 },
  eta_minutes: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  image_url: { type: String, default: null },
  image_key: { type: String, default: null },
  open_time: { type: String, default: null },
  close_time: { type: String, default: null },
  is_open: { type: Boolean, default: true },
  is_active: { type: Boolean, required: true, default: true },
  commission_rate: { type: String, default: '0.00' },
  manual_priority: { type: Number, default: 0 },
  refund_risk_penalty: { type: String, default: '0.00' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

restaurantSchema.index({ campus_id: 1, is_active: 1, name: 1 });

export const Restaurant = models.Restaurant || model<IRestaurant>('Restaurant', restaurantSchema);
