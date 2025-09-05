import { Router } from 'express'
import productos from './productos.js'
import clientes from './clientes.js'
import facturas from './facturas.js'
import detalles from './detalles.js'

const router = Router()

router.use('/productos', productos)
router.use('/clientes', clientes)
router.use('/facturas', facturas)
router.use('/facturas', detalles) // detalles anidados

export default router
