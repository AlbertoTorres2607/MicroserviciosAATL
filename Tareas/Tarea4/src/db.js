import 'dotenv/config'
import mysql from 'mysql2/promise'
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'ventas_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
