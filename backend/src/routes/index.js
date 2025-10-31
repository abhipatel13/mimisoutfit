import express from 'express'
import { optionalAuth } from '../middleware/authMiddleware.js'

// Import individual route groups

import adminRouter from './admin/index.js'
import adminAnalyticsRouter from './admin/analytics.routes.js'
import analyticsFullRouter from './admin/analytics.full.routes.js'
import authRoutes from './admin/auth.routes.js'
import productsRouter from './products.routes.js'
import moodboardsRouter from './moodboards.routes.js'

const router = express.Router()

// 🟢 Public Routes
router.use('/products', optionalAuth, productsRouter)
router.use('/moodboards', optionalAuth, moodboardsRouter)

// 🟡 Analytics & Auth
router.use('/api/analytics', analyticsFullRouter)
router.use('/admin/auth', authRoutes)

// 🔒 Admin Routes
router.use('/admin', adminRouter)
router.use('/admin/analytics', adminAnalyticsRouter)

// ✅ Health check
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Lookbook API is running',
    version: '1.0.0',
    endpoints: {
      public: ['/products', '/moodboards'],
      admin: ['/admin/auth', '/admin/products', '/admin/moodboards', '/admin/analytics']
    }
  })
})

// ✅ Debug: show registered routes
router.get('/debug/routes', (req, res) => {
  const routes = [];

  router.stack.forEach(m => {
    if (m.route) {
      // Direct route (e.g., router.get('/x'))
      routes.push({
        method: Object.keys(m.route.methods)[0].toUpperCase(),
        path: m.route.path
      });
    } else if (m.name === 'router' && m.handle?.stack) {
      // Nested router (e.g., router.use('/api', someRouter))
      const basePath = m.regexp ? m.regexp.toString()
        .replace(/^\/\^\\/, '/')
        .replace(/\\\/\?\(\?=\\\/\|\$\)\/i$/, '') : '';

      m.handle.stack.forEach(sub => {
        if (sub.route) {
          routes.push({
            method: Object.keys(sub.route.methods)[0].toUpperCase(),
            path: basePath + sub.route.path
          });
        }
      });
    }
  });

  res.json(routes);
});


export default router
