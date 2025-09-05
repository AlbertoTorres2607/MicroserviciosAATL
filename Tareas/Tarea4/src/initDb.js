import fs from 'fs'
import path from 'path'
import url from 'url'
import 'dotenv/config'
import mysql from 'mysql2/promise'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const schemaPath = path.join(__dirname, '..', 'schema.sql')
const sql = fs.readFileSync(schemaPath, 'utf-8')

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || ''
  })
  try {
    const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean)
    for (const stmt of statements) {
      await connection.query(stmt)
    }
    console.log('✅ Base de datos inicializada.')
  } catch (e) {
    console.error('❌ Error inicializando BD:', e.message)
    process.exit(1)
  } finally {
    await connection.end()
  }
}
run()
