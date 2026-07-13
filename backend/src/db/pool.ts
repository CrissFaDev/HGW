import mysql from 'mysql2/promise';
import { getDatabaseOptions } from './connection-options';

const pool = mysql.createPool({
  ...getDatabaseOptions(true),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

export default pool;
