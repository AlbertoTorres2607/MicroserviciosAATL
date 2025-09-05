import { Router } from 'express'
import { body } from 'express-validator'
import { pool } from '../db.js'

const router = Router()

/**
 * @openapi
 * /api/v1/facturas/{facturaId}/detalles:
 *   get: { summary: Listar detalles de una factura }
 *   post: { summary: Agregar detalle a una factura }
 */
router.get('/:facturaId/detalles', async (req, res, next) => {
  try {
    const facturaId = req.params.facturaId
    const [[fac]] = await pool.query('SELECT id FROM facturas WHERE id=?', [facturaId])
    if (!fac) return res.status(404).json({ error: 'Factura no encontrada' })
    const [rows] = await pool.query(
      `SELECT d.*, p.nombre AS producto_nombre, p.marca
       FROM detalles_factura d
       JOIN productos p ON p.id = d.producto_id
       WHERE d.factura_id=? ORDER BY d.id ASC`,
      [facturaId]
    )
    res.json(rows)
  } catch (e) { next(e) }
})

router.post('/:facturaId/detalles',
  body('producto_id').isInt({ min: 1 }),
  body('cantidad').isInt({ min: 1 }),
  body('precio_unitario').isFloat({ gt: 0 }),
  async (req, res, next) => {
    try {
      const facturaId = req.params.facturaId
      const { producto_id, cantidad, precio_unitario } = req.body
      const [[fac]] = await pool.query('SELECT id FROM facturas WHERE id=?', [facturaId])
      if (!fac) return res.status(404).json({ error: 'Factura no encontrada' })
      const [[prod]] = await pool.query('SELECT id FROM productos WHERE id=?', [producto_id])
      if (!prod) return res.status(400).json({ error: 'producto_id inválido' })
      const [result] = await pool.execute(
        `INSERT INTO detalles_factura (factura_id, producto_id, cantidad, precio_unitario)
         VALUES (?,?,?,?)`,
        [facturaId, producto_id, cantidad, precio_unitario]
      )
      const [[row]] = await pool.query('SELECT * FROM detalles_factura WHERE id=?', [result.insertId])
      res.status(201).json(row)
    } catch (e) { next(e) }
  }
)

/**
 * @openapi
 * /api/v1/facturas/{facturaId}/detalles/{detalleId}:
 *   put: { summary: Actualizar detalle }
 *   delete: { summary: Eliminar detalle }
 */
router.put('/:facturaId/detalles/:detalleId', async (req, res, next) => {
  try {
    const { detalleId } = req.params
    const { producto_id, cantidad, precio_unitario } = req.body
    if (producto_id) {
      const [[prod]] = await pool.query('SELECT id FROM productos WHERE id=?', [producto_id])
      if (!prod) return res.status(400).json({ error: 'producto_id inválido' })
    }
    const [result] = await pool.execute(
      `UPDATE detalles_factura SET producto_id=?, cantidad=?, precio_unitario=? WHERE id=?`,
      [producto_id, cantidad, precio_unitario, detalleId]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Detalle no encontrado' })
    const [[row]] = await pool.query('SELECT * FROM detalles_factura WHERE id=?', [detalleId])
    res.json(row)
  } catch (e) { next(e) }
})

router.delete('/:facturaId/detalles/:detalleId', async (req, res, next) => {
  try {
    const { detalleId } = req.params
    const [result] = await pool.execute('DELETE FROM detalles_factura WHERE id=?', [detalleId])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Detalle no encontrado' })
    res.status(204).send()
  } catch (e) { next(e) }
})

export default router
