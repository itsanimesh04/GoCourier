import path from 'node:path';

export function getSchemaPath() {
  return path.resolve(process.cwd(), 'Instructions', '01-database-schema.sql');
}
