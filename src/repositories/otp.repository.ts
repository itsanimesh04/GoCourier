import { pool } from '../db/pool';
import type { PoolClient } from 'pg';

export interface OtpRequestRow {
  id: string;
  phone: string;
  otp_code: string;
  expires_at: Date;
  verified_at: Date | null;
  created_at: Date;
}

export const otpRepository = {
  async countRecentByPhone(phone: string, since: Date): Promise<number> {
    const result = await pool.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM otp_request WHERE phone = $1 AND created_at >= $2',
      [phone, since]
    );
    return Number(result.rows[0]?.count ?? 0);
  },

  async create(phone: string, otpCode: string, expiresAt: Date): Promise<OtpRequestRow> {
    const result = await pool.query<OtpRequestRow>(
      'INSERT INTO otp_request (phone, otp_code, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [phone, otpCode, expiresAt]
    );
    return result.rows[0];
  },

  async findLatestValid(phone: string, otpCode: string, now: Date): Promise<OtpRequestRow | null> {
    const result = await pool.query<OtpRequestRow>(
      `SELECT *
       FROM otp_request
       WHERE phone = $1
         AND otp_code = $2
         AND verified_at IS NULL
         AND expires_at > $3
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone, otpCode, now]
    );
    return result.rows[0] ?? null;
  },

  async consumeLatestValidForUpdate(
    client: PoolClient,
    phone: string,
    otpCode: string,
    now: Date
  ): Promise<OtpRequestRow | null> {
    const result = await client.query<OtpRequestRow>(
      `WITH candidate AS (
         SELECT id
         FROM otp_request
         WHERE phone = $1
           AND otp_code = $2
           AND verified_at IS NULL
           AND expires_at > $3
         ORDER BY created_at DESC
         LIMIT 1
         FOR UPDATE
       )
       UPDATE otp_request o
       SET verified_at = now()
       FROM candidate c
       WHERE o.id = c.id
       RETURNING o.*`,
      [phone, otpCode, now]
    );
    return result.rows[0] ?? null;
  },

  async markVerified(id: string): Promise<void> {
    await pool.query('UPDATE otp_request SET verified_at = now() WHERE id = $1', [id]);
  }
};
