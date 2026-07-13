import { ConnectionOptions } from 'mysql2';

function sslEnabled(params?: URLSearchParams): boolean {
  const sslMode = params?.get('ssl-mode') || params?.get('sslmode');

  return process.env.DB_SSL === 'true' || sslMode === 'REQUIRED' || sslMode === 'require';
}

export function getDatabaseOptions(includeDatabase = true): ConnectionOptions {
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

  if (databaseUrl) {
    const url = new URL(databaseUrl);
    const database = url.pathname.replace(/^\//, '');

    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: includeDatabase ? database : undefined,
      ssl: sslEnabled(url.searchParams) ? { rejectUnauthorized: true } : undefined,
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: includeDatabase ? process.env.DB_NAME || 'pag_hgw' : undefined,
    ssl: sslEnabled() ? { rejectUnauthorized: true } : undefined,
  };
}

export function usesDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.MYSQL_URL);
}
