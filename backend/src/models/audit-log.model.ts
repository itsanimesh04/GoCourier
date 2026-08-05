import mongoose, { Schema, model, models } from 'mongoose';

export interface IAuditLog {
  _id: mongoose.Types.ObjectId;
  order_id: mongoose.Types.ObjectId | null;
  actor_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', default: null, index: true },
  actor_id: { type: String, default: null },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed, default: null },
}, {
  timestamps: { createdAt: 'created_at' }
});

auditLogSchema.index({ order_id: 1, created_at: -1 });
auditLogSchema.index({ actor_id: 1 });

export const AuditLog = models.AuditLog || model<IAuditLog>('AuditLog', auditLogSchema);