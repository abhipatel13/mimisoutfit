import express from 'express'
import { login } from '../../controllers/admin/auth.controller.js'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { createUser } from '../../controllers/admin/users.controller.js'

const router = express.Router()

// Authentication routes
router.post('/login', login)
router.post('/register', authMiddleware, createUser)

export default router
