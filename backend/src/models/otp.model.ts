import mongoose, { Schema, model, models } from 'mongoose';

export interface IOtpRequest {
  _id: mongoose.Types.ObjectId;
  phone: string;
  otp_code: string;
  expires_at: Date;
  verified_at: Date | null;
  created_at: Date;
}

const otpRequestSchema = new Schema<IOtpRequest>({
  phone: { type: String, required: true, index: true },
  otp_code: { type: String, required: true },
  expires_at: { type: Date, required: true },
  verified_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at' }
});

otpRequestSchema.index({ phone: 1, created_at: -1 });
otpRequestSchema.index({ phone: 1, otp_code: 1, verified_at: 1, expires_at: 1 });

export const OtpRequest = models.OtpRequest || model<IOtpRequest>('OtpRequest', otpRequestSchema);