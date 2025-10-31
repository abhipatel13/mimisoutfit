import express from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  bulkPublish,
  bulkDelete
} from '../../controllers/admin/admin-products.controller.js'

const router = express.Router()

router.post('/', authMiddleware, createProduct)
router.put('/:id', authMiddleware, updateProduct)
router.delete('/:id', authMiddleware, deleteProduct)
router.post('/:id/publish', authMiddleware, publishProduct)
router.post('/bulk/publish', authMiddleware, bulkPublish)
router.post('/bulk/delete', authMiddleware, bulkDelete)

export default router