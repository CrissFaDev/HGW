import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { ensureDefaultAdmin } from '../services/admin-user.service';

async function setupDatabase(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(process.cwd(), 'src', 'db', 'schema.sql'), 'utf8');
  await connection.query(schema);
  await connection.end();

  await ensureDefaultAdmin();
  console.log('Database schema and default admin are ready.');
}

setupDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
