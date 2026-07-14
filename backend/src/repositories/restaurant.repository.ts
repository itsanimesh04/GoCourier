import { findById, insertReturning, updateByIdReturning } from './base.repository';
import { pool } from '../db/pool';

export interface RestaurantRow {
  id: string;
  campus_id: string;
  name: string;
  is_active: boolean;
  commission_rate: string;
  manual_priority: number;
  refund_risk_penalty: string;
  created_at: Date;
}

export interface CustomerRestaurantRow {
  id: string;
  campus_id: string;
  name: string;
  is_active: boolean;
  manual_priority: number;
  created_at: Date;
  relevance_sort: number;
}

const columns = ['campus_id', 'name', 'is_active', 'commission_rate', 'manual_priority', 'refund_risk_penalty'];

export const restaurantRepository = {
  findById(id: string) {
    return findById<RestaurantRow>('restaurant', id);
  },

  async findActiveByIdForCampus(id: string, campusId: string): Promise<RestaurantRow | null> {
    const result = await pool.query<RestaurantRow>(
      'SELECT * FROM restaurant WHERE id = $1 AND campus_id = $2 AND is_active = true LIMIT 1',
      [id, campusId]
    );
    return result.rows[0] ?? null;
  },

  async listActiveByCampus(campusId: string, query?: string): Promise<CustomerRestaurantRow[]> {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
      const result = await pool.query<CustomerRestaurantRow>(
        `SELECT id, campus_id, name, is_active, manual_priority, created_at, 0 AS relevance_sort
         FROM restaurant
         WHERE campus_id = $1 AND is_active = true
         ORDER BY lower(name) ASC`,
        [campusId]
      );
      return result.rows;
    }

    const pattern = `%${trimmedQuery}%`;
    const result = await pool.query<CustomerRestaurantRow>(
      `SELECT r.id,
              r.campus_id,
              r.name,
              r.is_active,
              r.manual_priority,
              r.created_at,
              CASE WHEN r.name ILIKE $2 THEN 0 ELSE 1 END AS relevance_sort
       FROM restaurant r
       WHERE r.campus_id = $1
         AND r.is_active = true
         AND (
           r.name ILIKE $2
           OR EXISTS (
             SELECT 1
             FROM menu_item mi
             WHERE mi.restaurant_id = r.id
               AND mi.name ILIKE $2
           )
         )
       ORDER BY relevance_sort ASC, lower(r.name) ASC`,
      [campusId, pattern]
    );
    return result.rows;
  },

  create(data: Partial<RestaurantRow>) {
    return insertReturning<RestaurantRow>('restaurant', data, columns);
  },

  update(id: string, data: Partial<RestaurantRow>) {
    return updateByIdReturning<RestaurantRow>('restaurant', id, data, columns);
  }
};
