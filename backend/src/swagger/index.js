import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'
import express from 'express'

const swaggerPath = path.resolve('src/swagger/swagger.json')
const swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'))

export default function setupSwagger(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
}
