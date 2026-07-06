import { pool } from '../db/pool';
import { BadRequestError } from '../utils/errors';

type Row = Record<string, unknown>;

function definedEntries(data: Row, allowedColumns: string[]) {
  return allowedColumns
    .filter((column) => data[column] !== undefined)
    .map((column) => [column, data[column]] as const);
}

export async function findById<T>(tableName: string, id: string): Promise<T | null> {
  const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1 LIMIT 1`, [id]);
  return (result.rows[0] as T | undefined) ?? null;
}

export async function insertReturning<T>(
  tableName: string,
  data: Row,
  allowedColumns: string[]
): Promise<T> {
  const entries = definedEntries(data, allowedColumns);

  if (entries.length === 0) {
    throw new BadRequestError('No fields provided');
  }

  const columns = entries.map(([column]) => column);
  const values = entries.map(([, value]) => value);
  const placeholders = values.map((_, index) => `$${index + 1}`);

  const result = await pool.query(
    `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    values
  );

  return result.rows[0] as T;
}

export async function updateByIdReturning<T>(
  tableName: string,
  id: string,
  data: Row,
  allowedColumns: string[]
): Promise<T | null> {
  const entries = definedEntries(data, allowedColumns);

  if (entries.length === 0) {
    throw new BadRequestError('No fields provided to update');
  }

  const values = entries.map(([, value]) => value);
  const setClause = entries.map(([column], index) => `${column} = $${index + 1}`).join(', ');

  const result = await pool.query(
    `UPDATE ${tableName} SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id]
  );

  return (result.rows[0] as T | undefined) ?? null;
}
