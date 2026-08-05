import { OtpRequest, type IOtpRequest } from '../models/otp.model';

export interface OtpRequestRow {
  id: string;
  phone: string;
  otp_code: string;
  expires_at: Date;
  verified_at: Date | null;
  created_at: Date;
}

function toOtpRow(doc: IOtpRequest): OtpRequestRow {
  return {
    id: doc._id.toString(),
    phone: doc.phone,
    otp_code: doc.otp_code,
    expires_at: doc.expires_at,
    verified_at: doc.verified_at,
    created_at: doc.created_at
  };
}

export const otpRepository = {
  async countRecentByPhone(phone: string, since: Date): Promise<number> {
    const count = await OtpRequest.countDocuments({
      phone,
      created_at: { $gte: since }
    });
    return count;
  },

  async create(phone: string, otpCode: string, expiresAt: Date): Promise<OtpRequestRow> {
    const doc = await OtpRequest.create({
      phone,
      otp_code: otpCode,
      expires_at: expiresAt
    }) as IOtpRequest;
    return toOtpRow(doc);
  },

  async findLatestValid(phone: string, otpCode: string, now: Date): Promise<OtpRequestRow | null> {
    const doc = await OtpRequest.findOne({
      phone,
      otp_code: otpCode,
      verified_at: null,
      expires_at: { $gt: now }
    }).sort({ created_at: -1 }).lean() as IOtpRequest | null;
    return doc ? toOtpRow(doc) : null;
  },

  async consumeLatestValidForUpdate(
    client: unknown,
    phone: string,
    otpCode: string,
    now: Date
  ): Promise<OtpRequestRow | null> {
    const doc = await OtpRequest.findOneAndUpdate(
      { phone, otp_code: otpCode, verified_at: null, expires_at: { $gt: now } },
      { verified_at: new Date() },
      { new: true }
    ).lean() as IOtpRequest | null;
    return doc ? toOtpRow(doc) : null;
  },

  async markVerified(id: string): Promise<void> {
    await OtpRequest.findByIdAndUpdate(id, { verified_at: new Date() });
  }
};