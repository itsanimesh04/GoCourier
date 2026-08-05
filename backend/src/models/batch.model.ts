import mongoose, { Schema, model, models } from 'mongoose';

export type BatchStatus = 'pending' | 'locked' | 'out_for_delivery' | 'delivered' | 'closed';

export interface IBatch {
  _id: mongoose.Types.ObjectId;
  campus_id: mongoose.Types.ObjectId;
  service_date: string; // YYYY-MM-DD format
  batch_status: BatchStatus;
  delivery_agent_id: mongoose.Types.ObjectId | null;
  created_at: Date;
  updated_at: Date;
}

const batchSchema = new Schema<IBatch>({
  campus_id: { type: Schema.Types.ObjectId, ref: 'Campus', required: true, index: true },
  service_date: { type: String, required: true },
  batch_status: { type: String, enum: ['pending', 'locked', 'out_for_delivery', 'delivered', 'closed'], required: true, default: 'pending' },
  delivery_agent_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

batchSchema.index({ campus_id: 1, service_date: 1 });
batchSchema.index({ delivery_agent_id: 1 });

export const Batch = models.Batch || model<IBatch>('Batch', batchSchema);