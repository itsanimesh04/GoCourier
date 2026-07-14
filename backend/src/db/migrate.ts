import { readFile } from 'node:fs/promises';
import { pool } from './pool';
import { getSchemaPath } from './schema-path';

async function migrate() {
  const sql = await readFile(getSchemaPath(), 'utf8');

  await pool.query(sql);
  console.log('Database schema applied successfully.');
}

migrate()
  .catch((error) => {
    console.error('Database schema migration failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
