import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';
import pool from '../db/pool';

interface AdminCountRow extends RowDataPacket {
  total: number;
}

export async function ensureDefaultAdmin(): Promise<void> {
  const [[row]] = await pool.execute<AdminCountRow[]>('SELECT COUNT(*) AS total FROM admin_users');

  if (row.total > 0) {
    return;
  }

  const email = process.env.ADMIN_EMAIL || 'admin@hgw.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin12345';
  const passwordHash = await bcrypt.hash(password, 10);

  await pool.execute(
    `INSERT INTO admin_users (name, email, password_hash)
     VALUES (:name, :email, :passwordHash)`,
    {
      name: 'Administrador HGW',
      email,
      passwordHash,
    },
  );

  console.log(`Default admin user ready: ${email}`);
}
