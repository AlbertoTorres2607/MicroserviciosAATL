import { Router } from 'express'
import { body } from 'express-validator'
import { pool } from '../db.js'
import { getPagination } from '../utils/pagination.js'

const router = Router()

/**
 * @openapi
 * /api/v1/facturas:
 *   get: { summary: Listar facturas (incluye cliente) }
 *   post: { summary: Crear factura }
 */
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query)
    const [rows] = await pool.query(
      `SELECT f.*, c.ci, c.nombres, c.apellidos
       FROM facturas f
       JOIN clientes c ON c.id = f.cliente_id
       ORDER BY f.id ASC
       LIMIT ? OFFSET ?`, [limit, offset]
    )
    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM facturas')
    res.json({ page, total: countRows[0].total, items: rows })
  } catch (e) { next(e) }
})

router.post('/',
  body('fecha').isISO8601(),
  body('cliente_id').isInt({ min: 1 }),
  async (req, res, next) => {
    const conn = await pool.getConnection()
    try {
      const { fecha, cliente_id } = req.body
      const [cli] = await conn.query('SELECT id FROM clientes WHERE id=?', [cliente_id])
      if (!cli.length) {
        conn.release()
        return res.status(400).json({ error: 'cliente_id inválido' })
      }
      const [result] = await conn.execute(
        'INSERT INTO facturas (fecha, cliente_id) VALUES (?,?)',
        [fecha, cliente_id]
      )
      const [rows] = await conn.query('SELECT * FROM facturas WHERE id=?', [result.insertId])
      res.status(201).json(rows[0])
    } catch (e) { next(e) } finally { conn.release() }
  }
)

/**
 * @openapi
 * /api/v1/facturas/{id}:
 *   get: { summary: Obtener factura por id (cliente y detalles con producto) }
 *   put: { summary: Actualizar factura }
 *   delete: { summary: Eliminar factura }
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const [[factura]] = await pool.query('SELECT * FROM facturas WHERE id=?', [id])
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' })
    const [[cliente]] = await pool.query('SELECT * FROM clientes WHERE id=?', [factura.cliente_id])
    const [detalles] = await pool.query(
      `SELECT d.*, p.nombre AS producto_nombre, p.marca
       FROM detalles_factura d
       JOIN productos p ON p.id = d.producto_id
       WHERE d.factura_id=?
       ORDER BY d.id ASC`, [id]
    )
    res.json({ ...factura, cliente, detalles })
  } catch (e) { next(e) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { fecha, cliente_id } = req.body
    if (cliente_id) {
      const [cli] = await pool.query('SELECT id FROM clientes WHERE id=?', [cliente_id])
      if (!cli.length) return res.status(400).json({ error: 'cliente_id inválido' })
    }
    const [result] = await pool.execute(
      'UPDATE facturas SET fecha=?, cliente_id=? WHERE id=?',
      [fecha, cliente_id, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Factura no encontrada' })
    const [[row]] = await pool.query('SELECT * FROM facturas WHERE id=?', [req.params.id])
    res.json(row)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM facturas WHERE id=?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Factura no encontrada' })
    res.status(204).send()
  } catch (e) { next(e) }
})

router.get('/cliente/:clienteId', async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query)
    const clienteId = req.params.clienteId
    const [rows] = await pool.query(
      `SELECT * FROM facturas WHERE cliente_id=? ORDER BY id ASC LIMIT ? OFFSET ?`,
      [clienteId, limit, offset]
    )
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM facturas WHERE cliente_id=?`,
      [clienteId]
    )
    res.json({ page, total: countRows[0].total, items: rows })
  } catch (e) { next(e) }
})

export default router
