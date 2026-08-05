import mongoose, { Schema, model, models } from 'mongoose';

export type OrderStatus = 
  | 'cart' 
  | 'placed' 
  | 'locked' 
  | 'procuring' 
  | 'confirmed' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'closed' 
  | 'cancelled';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'late' | 'refunded' | 'partially_refunded';

export interface IOrder {
  _id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  campus_id: mongoose.Types.ObjectId;
  restaurant_id: mongoose.Types.ObjectId;
  batch_id: mongoose.Types.ObjectId | null;
  drop_point: string | null;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: string;
  fee: string;
  total_amount: string;
  placed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const orderSchema = new Schema<IOrder>({
  student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  campus_id: { type: Schema.Types.ObjectId, ref: 'Campus', required: true },
  restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  batch_id: { type: Schema.Types.ObjectId, ref: 'Batch', default: null },
  drop_point: { type: String, default: null },
  order_status: { type: String, enum: ['cart', 'placed', 'locked', 'procuring', 'confirmed', 'out_for_delivery', 'delivered', 'closed', 'cancelled'], required: true, default: 'cart' },
  payment_status: { type: String, enum: ['pending', 'success', 'failed', 'late', 'refunded', 'partially_refunded'], required: true, default: 'pending' },
  subtotal: { type: String, required: true, default: '0.00' },
  fee: { type: String, required: true, default: '0.00' },
  total_amount: { type: String, required: true, default: '0.00' },
  placed_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

orderSchema.index({ student_id: 1, order_status: 1, payment_status: 1 });
orderSchema.index({ campus_id: 1, order_status: 1 });
orderSchema.index({ batch_id: 1 });

export const Order = models.Order || model<IOrder>('Order', orderSchema);