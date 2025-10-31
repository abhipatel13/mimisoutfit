import express from 'express'
import {
  listMoodboards,
  getFeaturedMoodboards,
  getTags,
  getBySlug,
  getById,
  getProductsForMoodboard
} from '../controllers/moodboards.controller.js'

const router = express.Router()

router.get('/', listMoodboards)
router.get('/featured', getFeaturedMoodboards)
router.get('/tags', getTags)
router.get('/slug/:slug', getBySlug)
router.get('/:id', getById)
router.get('/:id/products', getProductsForMoodboard)

export default router
