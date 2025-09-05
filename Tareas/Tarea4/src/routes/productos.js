import { Router } from 'express'
import { body } from 'express-validator'
import { pool } from '../db.js'
import { getPagination } from '../utils/pagination.js'

const router = Router()

/**
 * @openapi
 * /api/v1/productos:
 *   get:
 *     summary: Listar productos (con paginación y búsqueda por nombre/marca)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Crear producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, stock]
 *             properties:
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *               marca: { type: string }
 *               stock: { type: integer }
 *     responses:
 *       201: { description: Creado }
 */
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query)
    const q = (req.query.q || '').trim()
    let where = ''
    const params = []
    if (q) {
      where = "WHERE nombre LIKE ? OR marca LIKE ?"
      params.push(`%${q}%`, `%${q}%`)
    }
    const [rows] = await pool.query(
      `SELECT * FROM productos ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM productos ${where}`,
      params
    )
    res.json({ page, total: countRows[0].total, items: rows })
  } catch (e) { next(e) }
})

router.post('/',
  body('nombre').isString().notEmpty(),
  body('stock').isInt({ min: 0 }),
  async (req, res, next) => {
    try {
      const { nombre, descripcion, marca, stock } = req.body
      const [result] = await pool.execute(
        'INSERT INTO productos (nombre, descripcion, marca, stock) VALUES (?,?,?,?)',
        [nombre, descripcion || null, marca || null, stock]
      )
      const [rows] = await pool.query('SELECT * FROM productos WHERE id=?', [result.insertId])
      res.status(201).json(rows[0])
    } catch (e) { next(e) }
  }
)

/**
 * @openapi
 * /api/v1/productos/{id}:
 *   get: { summary: Obtener producto por id, responses: { 200: { description: OK }, 404: { description: No encontrado } } }
 *   put: { summary: Actualizar producto, responses: { 200: { description: OK }, 404: { description: No encontrado } } }
 *   delete: { summary: Eliminar producto, responses: { 204: { description: Sin contenido }, 404: { description: No encontrado } } }
 */
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id=?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(rows[0])
  } catch (e) { next(e) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { nombre, descripcion, marca, stock } = req.body
    const [result] = await pool.execute(
      'UPDATE productos SET nombre=?, descripcion=?, marca=?, stock=? WHERE id=?',
      [nombre, descripcion || null, marca || null, stock, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' })
    const [rows] = await pool.query('SELECT * FROM productos WHERE id=?', [req.params.id])
    res.json(rows[0])
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM productos WHERE id=?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' })
    res.status(204).send()
  } catch (e) { next(e) }
})

export default router
