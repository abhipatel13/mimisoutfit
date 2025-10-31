import express from 'express'
import {
  listProducts,
  getFeatured,
  getBrands,
  getCategories,
  getTags,
  getBySlug,
  getById,
  getRelated,
  getHomeFeatured
} from '../controllers/products.controller.js'

const router = express.Router()

router.get('/', listProducts)
router.get('/homeFeatured', getHomeFeatured)
router.get('/featured', getFeatured)
router.get('/brands', getBrands)
router.get('/categories', getCategories)
router.get('/tags', getTags)
router.get('/slug/:slug', getBySlug)
router.get('/:id', getById)
router.get('/:id/related', getRelated)

export default router
