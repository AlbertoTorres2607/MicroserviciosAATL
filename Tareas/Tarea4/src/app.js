import 'dotenv/config'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import router from './routes/index.js'

const app = express()
app.use(express.json())

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API RESTful Ventas (sin ORM)',
      version: '1.0.0',
      description: 'Express + mysql2. Recursos: productos, clientes, facturas y detalles.'
    },
    servers: [{ url: 'http://localhost:' + (process.env.PORT || 3000) }]
  },
  apis: ['./src/routes/*.js']
})
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req, res) => res.json({ ok: true, msg: 'API Ventas (sin ORM)' }))

app.use('/api/v1', router)

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Error interno' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log('🚀 Servidor en http://localhost:' + PORT + '  Docs: /docs'))
