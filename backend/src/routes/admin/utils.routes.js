import express from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { getStats, upload, uploadImage } from '../../controllers/admin/utils.controller.js'

const router = express.Router()

router.get('/stats', authMiddleware, getStats)
router.post('/upload/image', authMiddleware, upload.single('file'), uploadImage)

export default router
