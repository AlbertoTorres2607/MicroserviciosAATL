import { Router } from 'express'
import { body } from 'express-validator'
import { pool } from '../db.js'
import { getPagination } from '../utils/pagination.js'

const router = Router()

/**
 * @openapi
 * /api/v1/clientes:
 *   get:
 *     summary: Listar clientes (paginación y búsqueda por CI/nombres/apellidos)
 *   post:
 *     summary: Crear cliente
 */
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query)
    const q = (req.query.q || '').trim()
    let where = ''
    const params = []
    if (q) {
      where = "WHERE ci LIKE ? OR nombres LIKE ? OR apellidos LIKE ?"
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }
    const [rows] = await pool.query(
      `SELECT * FROM clientes ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM clientes ${where}`,
      params
    )
    res.json({ page, total: countRows[0].total, items: rows })
  } catch (e) { next(e) }
})

router.post('/',
  body('ci').isString().notEmpty(),
  body('nombres').isString().notEmpty(),
  body('apellidos').isString().notEmpty(),
  body('sexo').isIn(['M','F','O']),
  async (req, res, next) => {
    try {
      const { ci, nombres, apellidos, sexo } = req.body
      const [result] = await pool.execute(
        'INSERT INTO clientes (ci, nombres, apellidos, sexo) VALUES (?,?,?,?)',
        [ci, nombres, apellidos, sexo]
      )
      const [rows] = await pool.query('SELECT * FROM clientes WHERE id=?', [result.insertId])
      res.status(201).json(rows[0])
    } catch (e) { next(e) }
  }
)

/**
 * @openapi
 * /api/v1/clientes/{id}:
 *   get: { summary: Obtener cliente por id (incluye facturas) }
 *   put: { summary: Actualizar cliente }
 *   delete: { summary: Eliminar cliente }
 */
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id=?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' })
    const [facturas] = await pool.query('SELECT * FROM facturas WHERE cliente_id=? ORDER BY id ASC', [req.params.id])
    res.json({ ...rows[0], facturas })
  } catch (e) { next(e) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { ci, nombres, apellidos, sexo } = req.body
    const [result] = await pool.execute(
      'UPDATE clientes SET ci=?, nombres=?, apellidos=?, sexo=? WHERE id=?',
      [ci, nombres, apellidos, sexo, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' })
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id=?', [req.params.id])
    res.json(rows[0])
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM clientes WHERE id=?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.status(204).send()
  } catch (e) { next(e) }
})

export default router
