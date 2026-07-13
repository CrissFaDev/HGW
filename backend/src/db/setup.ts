import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { ensureDefaultAdmin } from '../services/admin-user.service';
import { getDatabaseOptions, usesDatabaseUrl } from './connection-options';

async function setupDatabase(): Promise<void> {
  const connection = await mysql.createConnection({
    ...getDatabaseOptions(usesDatabaseUrl()),
    multipleStatements: true,
  });

  let schema = fs.readFileSync(path.join(process.cwd(), 'src', 'db', 'schema.sql'), 'utf8');

  if (usesDatabaseUrl()) {
    schema = schema
      .replace(/CREATE DATABASE IF NOT EXISTS[\s\S]*?;\s*/i, '')
      .replace(/USE\s+\w+;\s*/i, '');
  }

  await connection.query(schema);
  await connection.end();

  await ensureDefaultAdmin();
  console.log('Database schema and default admin are ready.');
}

setupDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
