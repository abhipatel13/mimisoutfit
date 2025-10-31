import express from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import {
  trackLimiter, trackEvents,
  getTimeSeries, getCategories,
  getFunnel, getTrends
} from '../../controllers/admin/analytics.full.controller.js'

const router = express.Router()

// Public tracking
router.post('/track', trackLimiter, trackEvents)

// Admin-protected analytics
router.get('/timeseries', authMiddleware, getTimeSeries)
router.get('/categories', authMiddleware, getCategories)
router.get('/funnel', authMiddleware, getFunnel)
router.get('/trends', authMiddleware, getTrends)

export default router
