import mongoose, { Schema, model, models } from 'mongoose';
import type { OrderStatus } from './order.model';

export type DeliveryResult = 'delivered' | 'not_delivered';

export interface IDeliveryAttempt {
  _id: mongoose.Types.ObjectId;
  order_id: mongoose.Types.ObjectId;
  batch_id: mongoose.Types.ObjectId;
  agent_id: mongoose.Types.ObjectId;
  result: DeliveryResult;
  proof_type: string | null;
  proof_value: string | null;
  not_delivered_reason: string | null;
  attempted_at: Date;
  created_at: Date;
}

const deliveryAttemptSchema = new Schema<IDeliveryAttempt>({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  batch_id: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  agent_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  result: { type: String, enum: ['delivered', 'not_delivered'], required: true },
  proof_type: { type: String, default: null },
  proof_value: { type: String, default: null },
  not_delivered_reason: { type: String, default: null },
  attempted_at: { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: 'created_at' }
});

deliveryAttemptSchema.index({ order_id: 1, result: 1 });

export const DeliveryAttempt = models.DeliveryAttempt || model<IDeliveryAttempt>('DeliveryAttempt', deliveryAttemptSchema);