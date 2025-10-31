import express from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import {
  getOverview,
  getUserBehavior,
  getProductAnalytics,
  getProductAnalyticsById,
  getMoodboardAnalytics,
  getRecentActivity
} from '../../controllers/admin/analytics.controller.js'

const router = express.Router()

router.get('/overview', authMiddleware, getOverview)
router.get('/user-behavior', authMiddleware, getUserBehavior)
// Alias to match spec nomenclature
router.get('/users', authMiddleware, getUserBehavior)
router.get('/products', authMiddleware, getProductAnalytics)
router.get('/products/:productId', authMiddleware, getProductAnalyticsById)
router.get('/moodboards', authMiddleware, getMoodboardAnalytics)
router.get('/recent-activity', authMiddleware, getRecentActivity)

export default router
