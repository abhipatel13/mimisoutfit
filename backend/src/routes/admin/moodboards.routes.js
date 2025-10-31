import express from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import {
  createMoodboard,
  updateMoodboard,
  deleteMoodboard,
  publishMoodboard,
  bulkPublishMoodboards,
  bulkDeleteMoodboards
} from '../../controllers/admin/admin-moodboards.controller.js'

const router = express.Router()

router.post('/', authMiddleware, createMoodboard)
router.put('/:id', authMiddleware, updateMoodboard)
router.delete('/:id', authMiddleware, deleteMoodboard)
router.post('/:id/publish', authMiddleware, publishMoodboard)
router.post('/bulk/publish', authMiddleware, bulkPublishMoodboards)
router.post('/bulk/delete', authMiddleware, bulkDeleteMoodboards)

export default router



