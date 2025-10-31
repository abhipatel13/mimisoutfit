import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getStats = async (_req, res) => {
  const products = await prisma.product.count()
  const featuredProducts = await prisma.product.count({ where: { isFeatured: true } })
  const moodboards = await prisma.moodboard.count()
  const featuredMoodboards = await prisma.moodboard.count({ where: { isFeatured: true } })
  res.json({
    products: {
      total: products,
      published: featuredProducts,
      unpublished: products - featuredProducts
    },
    moodboards: {
      total: moodboards,
      published: featuredMoodboards,
      unpublished: moodboards - featuredMoodboards
    }
  })
}

const uploadDir = path.resolve('uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})

export const upload = multer({ storage })

export const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: { code: 'INVALID_FILE' } })
  res.json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
    mimeType: req.file.mimetype
  })
}
