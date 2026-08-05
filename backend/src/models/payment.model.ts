import mongoose, { Schema, model, models } from 'mongoose';

export interface IPayment {
  _id: mongoose.Types.ObjectId;
  order_id: mongoose.Types.ObjectId;
  gateway: string;
  gateway_order_id: string | null;
  gateway_txn_id: string | null;
  amount: string;
  status: string;
  webhook_payload: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

const paymentSchema = new Schema<IPayment>({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
  gateway: { type: String, required: true },
  gateway_order_id: { type: String, default: null },
  gateway_txn_id: { type: String, default: null },
  amount: { type: String, required: true },
  status: { type: String, required: true, default: 'created' },
  webhook_payload: { type: Schema.Types.Mixed, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

paymentSchema.index({ gateway: 1, gateway_order_id: 1 });
paymentSchema.index({ gateway: 1, gateway_txn_id: 1 });
paymentSchema.index({ order_id: 1, gateway: 1, status: 1 });

export const Payment = models.Payment || model<IPayment>('Payment', paymentSchema);