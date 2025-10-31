import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import setupSwagger from './swagger/index.js'
import router from './routes/index.js'


dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

// // 🔍 Log responses
// app.use((req, res, next) => {
//   res.on('finish', () => {
//     if (res.statusCode >= 400) {
//       console.warn(`⚠️ ${req.method} ${req.originalUrl} finished with ${res.statusCode}`)
//     }
//   })
//   next()
// })

// ✅ Mount global router
// app.use(globalGetLogger)  
app.use('/', router)

// 📘 Swagger after all routes
setupSwagger(app)

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not Found' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error('🧨 Global error handler:', err)
  if (res.headersSent) return next(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`)
  console.log(`📘 Swagger docs available at http://localhost:${PORT}/docs`)
})
