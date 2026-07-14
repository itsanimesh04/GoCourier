import type { PoolClient } from 'pg';
import { pool } from './pool';

/**
 * Runs `callback` inside a single BEGIN/COMMIT block on a dedicated connection.
 * Rolls back and re-throws on any error. Always releases the connection.
 */
export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
