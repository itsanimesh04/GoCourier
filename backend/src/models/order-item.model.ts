import mongoose, { Schema, model, models } from 'mongoose';

export type ItemStatus = 'pending' | 'confirmed' | 'unavailable' | 'refunded';
export type OrderItemKind = 'food' | 'extra' | 'custom_request' | 'parcel';

export interface IAddonSnapshot {
  id: string;
  name: string;
  price: string;
}

export interface IOrderItem {
  _id: mongoose.Types.ObjectId;
  order_id: mongoose.Types.ObjectId;
  item_kind: OrderItemKind;
  menu_item_id: mongoose.Types.ObjectId | null;
  extras_product_id: mongoose.Types.ObjectId | null;
  item_name_snap: string;
  price_snapshot: string;
  quantity: number;
  item_status: ItemStatus;
  refund_amount: string | null;
  note: string | null;
  image_url: string | null;
  addon_snapshot: IAddonSnapshot[];
  pickup_point: string | null;
  drop_point: string | null;
  size: string | null;
  created_at: Date;
  updated_at: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  item_kind: {
    type: String,
    enum: ['food', 'extra', 'custom_request', 'parcel'],
    required: true,
    default: 'food'
  },
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', default: null },
  extras_product_id: { type: Schema.Types.ObjectId, ref: 'ExtraProduct', default: null },
  item_name_snap: { type: String, required: true },
  price_snapshot: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  item_status: { type: String, enum: ['pending', 'confirmed', 'unavailable', 'refunded'], required: true, default: 'pending' },
  refund_amount: { type: String, default: null },
  note: { type: String, default: null },
  image_url: { type: String, default: null },
  addon_snapshot: {
    type: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: String, required: true }
      }
    ],
    default: []
  },
  pickup_point: { type: String, default: null },
  drop_point: { type: String, default: null },
  size: { type: String, default: null }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

orderItemSchema.index({ menu_item_id: 1 });

export const OrderItem = models.OrderItem || model<IOrderItem>('OrderItem', orderItemSchema);
