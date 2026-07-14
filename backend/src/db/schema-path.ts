import path from 'node:path';

export function getSchemaPath() {
  return path.resolve(__dirname, '../../..', 'Instructions', '01-database-schema.sql');
}
