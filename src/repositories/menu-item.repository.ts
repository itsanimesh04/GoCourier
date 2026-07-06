import type { PoolClient } from 'pg';
import { findById, insertReturning, updateByIdReturning } from './base.repository';
import { pool } from '../db/pool';


export interface MenuItemRow {
  id: string;
  restaurant_id: string;
  name: string;
  price: string;
  is_veg: boolean | null;
  is_available: boolean;
  created_at: Date;
}

const columns = ['restaurant_id', 'name', 'price', 'is_veg', 'is_available'];
const updateColumns = ['name', 'price', 'is_veg', 'is_available'];

export const menuItemRepository = {
  findById(id: string) {
    return findById<MenuItemRow>('menu_item', id);
  },

  async listByRestaurant(restaurantId: string): Promise<MenuItemRow[]> {
    const result = await pool.query<MenuItemRow>(
      'SELECT * FROM menu_item WHERE restaurant_id = $1 ORDER BY lower(name) ASC',
      [restaurantId]
    );
    return result.rows;
  },

  async findByIdsForRestaurant(restaurantId: string, ids: string[]): Promise<MenuItemRow[]> {
    const result = await pool.query<MenuItemRow>(
      'SELECT * FROM menu_item WHERE restaurant_id = $1 AND id = ANY($2::uuid[])',
      [restaurantId, ids]
    );
    return result.rows;
  },

  /**
   * Transactional variant: acquires a FOR SHARE lock on each matched row so
   * that a concurrent UPDATE flipping is_available must wait until this
   * transaction commits. Use this inside cart create/replace transactions to
   * close the TOCTOU window between the availability check and the item insert.
   */
  async findByIdsForRestaurantForShare(
    client: PoolClient,
    restaurantId: string,
    ids: string[]
  ): Promise<MenuItemRow[]> {
    const result = await client.query<MenuItemRow>(
      'SELECT * FROM menu_item WHERE restaurant_id = $1 AND id = ANY($2::uuid[]) FOR SHARE',
      [restaurantId, ids]
    );
    return result.rows;
  },


  create(data: Partial<MenuItemRow>) {
    return insertReturning<MenuItemRow>('menu_item', data, columns);
  },

  update(id: string, data: Partial<MenuItemRow>) {
    return updateByIdReturning<MenuItemRow>('menu_item', id, data, updateColumns);
  }
};
