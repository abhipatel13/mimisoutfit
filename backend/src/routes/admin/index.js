import express from 'express'
import productRoutes from './products.routes.js'
import moodboardRoutes from './moodboards.routes.js'
import utilsRoutes from './utils.routes.js'

const router = express.Router()

router.use('/products', productRoutes)
router.use('/moodboards', moodboardRoutes)
router.use('/', utilsRoutes)

export default router
