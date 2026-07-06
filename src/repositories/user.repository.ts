import { pool } from '../db/pool';
import type { PoolClient } from 'pg';
import type { UserRole } from '../types/auth';

export interface UserRow {
  id: string;
  phone: string;
  name: string | null;
  role: UserRole;
  campus_id: string | null;
  drop_point: string | null;
  is_active: boolean;
  created_at: Date;
}

export const userRepository = {
  async findById(id: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>('SELECT * FROM app_user WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] ?? null;
  },

  async findByPhone(phone: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>('SELECT * FROM app_user WHERE phone = $1 LIMIT 1', [phone]);
    return result.rows[0] ?? null;
  },

  async createStudentByPhone(phone: string): Promise<UserRow> {
    const result = await pool.query<UserRow>(
      "INSERT INTO app_user (phone, role, campus_id) VALUES ($1, 'student', NULL) RETURNING *",
      [phone]
    );
    return result.rows[0];
  },

  async findOrCreateStudentByPhone(client: PoolClient, phone: string): Promise<UserRow> {
    const result = await client.query<UserRow>(
      `INSERT INTO app_user (phone, role, campus_id)
       VALUES ($1, 'student', NULL)
       ON CONFLICT (phone) DO UPDATE SET phone = app_user.phone
       RETURNING *`,
      [phone]
    );
    return result.rows[0];
  },

  async updateCampus(id: string, campusId: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      "UPDATE app_user SET campus_id = $2 WHERE id = $1 AND role = 'student' RETURNING *",
      [id, campusId]
    );
    return result.rows[0] ?? null;
  }
};
