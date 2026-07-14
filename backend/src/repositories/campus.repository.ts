import { findById, insertReturning, updateByIdReturning } from './base.repository';
import { pool } from '../db/pool';

export interface CampusRow {
  id: string;
  name: string;
  city: string;
  cutoff_time: string;
  delivery_time: string;
  is_active: boolean;
  created_at: Date;
}

const columns = ['name', 'city', 'cutoff_time', 'delivery_time', 'is_active'];

export const campusRepository = {
  async listActive(): Promise<CampusRow[]> {
    const result = await pool.query<CampusRow>(
      'SELECT * FROM campus WHERE is_active = true ORDER BY lower(name) ASC'
    );
    return result.rows;
  },

  findById(id: string) {
    return findById<CampusRow>('campus', id);
  },

  async findActiveById(id: string): Promise<CampusRow | null> {
    const result = await pool.query<CampusRow>(
      'SELECT * FROM campus WHERE id = $1 AND is_active = true LIMIT 1',
      [id]
    );
    return result.rows[0] ?? null;
  },

  create(data: Partial<CampusRow>) {
    return insertReturning<CampusRow>('campus', data, columns);
  },

  update(id: string, data: Partial<CampusRow>) {
    return updateByIdReturning<CampusRow>('campus', id, data, columns);
  }
};
