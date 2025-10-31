import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const createMoodboard = async (req, res) => {
  try {
    const { title, slug, description, coverImage, productIds, tags, isFeatured, stylingTips, howToWear } = req.body

    const existing = await prisma.moodboard.findUnique({ where: { slug } })
    if (existing) return res.status(409).json({ error: { code: 'DUPLICATE_SLUG' } })

    const moodboard = await prisma.moodboard.create({
      data: {
        title,
        slug,
        description,
        coverImage: coverImage,
        isFeatured: isFeatured ?? false,
        howToWear: howToWear,
        tags: { create: tags?.map(tag => ({ tag })) || [] },
        stylingTips: { create: stylingTips?.map((tip, i) => ({ tip, sortOrder: i })) || [] },
        products: {
          create: productIds.map((pid, i) => ({ productId: pid, sortOrder: i }))
        }
      },
      include: {
        tags: true,
        products: { include: { product: true } },
        stylingTips: true
      }
    })
    res.status(201).json(moodboard)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: { code: 'INTERNAL_ERROR' } })
  }
}

export const updateMoodboard = async (req, res) => {
  const { id } = req.params
  const data = req.body

  const moodboard = await prisma.moodboard.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      isFeatured: data.isFeatured,
      products: {
        deleteMany: {},
        create: data.productIds.map((pid, i) => ({ productId: pid, sortOrder: i }))
      }
    },
    include: { tags: true, products: { include: { product: true } } }
  })
  res.json(moodboard)
}

export const deleteMoodboard = async (req, res) => {
  const { id } = req.params
  await prisma.moodboard.delete({ where: { id } })
  res.status(204).send()
}

export const publishMoodboard = async (req, res) => {
  const { id } = req.params
  const { publish } = req.body
  const moodboard = await prisma.moodboard.update({
    where: { id },
    data: { isFeatured: publish },
    include: { tags: true, products: true }
  })
  res.json(moodboard)
}

export const bulkPublishMoodboards = async (req, res) => {
  const { publish } = req.body
  const moodboardIds = Array.isArray(req.body.moodboardIds) ? req.body.moodboardIds : req.body.ids
  await prisma.moodboard.updateMany({ where: { id: { in: moodboardIds } }, data: { isFeatured: publish } })
  res.json({ success: true, updated: moodboardIds.length, failed: 0 })
}

export const bulkDeleteMoodboards = async (req, res) => {
  const moodboardIds = Array.isArray(req.body.moodboardIds) ? req.body.moodboardIds : req.body.ids
  await prisma.moodboard.deleteMany({ where: { id: { in: moodboardIds } } })
  res.json({ success: true, deleted: moodboardIds.length, failed: 0 })
}
