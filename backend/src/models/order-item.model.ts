import mongoose, { Schema, model, models } from 'mongoose';

export type ItemStatus = 'pending' | 'confirmed' | 'unavailable' | 'refunded';

export interface IOrderItem {
  _id: mongoose.Types.ObjectId;
  order_id: mongoose.Types.ObjectId;
  menu_item_id: mongoose.Types.ObjectId;
  item_name_snap: string;
  price_snapshot: string;
  quantity: number;
  item_status: ItemStatus;
  refund_amount: string | null;
  created_at: Date;
  updated_at: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  item_name_snap: { type: String, required: true },
  price_snapshot: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  item_status: { type: String, enum: ['pending', 'confirmed', 'unavailable', 'refunded'], required: true, default: 'pending' },
  refund_amount: { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

orderItemSchema.index({ menu_item_id: 1 });

export const OrderItem = models.OrderItem || model<IOrderItem>('OrderItem', orderItemSchema);