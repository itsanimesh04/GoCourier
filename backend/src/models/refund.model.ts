import mongoose, { Schema, model, models } from 'mongoose';

export type RefundStatus = 'pending' | 'initiated' | 'processed' | 'failed';

export interface IRefund {
  _id: mongoose.Types.ObjectId;
  order_id: mongoose.Types.ObjectId;
  order_item_id: mongoose.Types.ObjectId | null;
  amount: string;
  reason: string;
  status: RefundStatus;
  gateway_refund_id: string | null;
  initiated_by: string | null;
  created_at: Date;
  processed_at: Date | null;
  updated_at: Date;
}

const refundSchema = new Schema<IRefund>({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  order_item_id: { type: Schema.Types.ObjectId, ref: 'OrderItem', default: null },
  amount: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'initiated', 'processed', 'failed'], required: true, default: 'pending' },
  gateway_refund_id: { type: String, default: null },
  initiated_by: { type: String, default: null },
  processed_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

refundSchema.index({ gateway_refund_id: 1 });
refundSchema.index({ status: 1 });

export const Refund = models.Refund || model<IRefund>('Refund', refundSchema);