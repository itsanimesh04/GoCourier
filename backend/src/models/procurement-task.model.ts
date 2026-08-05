import mongoose, { Schema, model, models } from 'mongoose';

export type ProcurementTaskStatus = 'pending' | 'placed' | 'confirmed' | 'delivered';

export interface IProcurementTask {
  _id: mongoose.Types.ObjectId;
  batch_id: mongoose.Types.ObjectId;
  restaurant_id: mongoose.Types.ObjectId;
  status: ProcurementTaskStatus;
  external_order_ref: string | null;
  actual_cost: string | null;
  platform: string | null;
  created_at: Date;
  updated_at: Date;
}

const procurementTaskSchema = new Schema<IProcurementTask>({
  batch_id: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
  restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  status: { type: String, enum: ['pending', 'placed', 'confirmed', 'delivered'], required: true, default: 'pending' },
  external_order_ref: { type: String, default: null },
  actual_cost: { type: String, default: null },
  platform: { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

procurementTaskSchema.index({ batch_id: 1, restaurant_id: 1 }, { unique: true });

export const ProcurementTask = models.ProcurementTask || model<IProcurementTask>('ProcurementTask', procurementTaskSchema);