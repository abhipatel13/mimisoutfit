// src/controllers/moodboards.controller.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


/**
 * Normalize a moodboard by flattening the join table products[]
 * so each product object is merged with the moodboard-product relation fields.
 */
const normalizeMoodboard = (moodboard) => ({
  ...moodboard,
  // ✅ Normalize tags to array of strings
  tags: moodboard.tags?.map(t => t.tag) || [],
  
  // ✅ Flatten products and normalize their tags too
  products: moodboard.products?.map(mp => ({
    ...mp.product,
    moodboardId: mp.moodboardId,
    sortOrder: mp.sortOrder,
    tags: mp.product?.tags?.map(t => t.tag) || []
  })) || []
})


/**
 * GET /moodboards
 * Returns a list of published moodboards with products & tags.
 */
export const listMoodboards = async (req, res) => {
  try {
    console.log('📸 Listing moodboards with query:', req.query)

    const moodboards = await prisma.moodboard.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
     }
    })

    const data = moodboards.map(normalizeMoodboard)
    res.json({ data })
  } catch (err) {
    console.error('❌ Moodboard list error:', err)
    res.status(500).json({ error: 'Failed to fetch moodboards' })
  }
}

/**
 * GET /moodboards/featured
 * Returns a few featured moodboards.
 */
export const getFeaturedMoodboards = async (req, res) => {
  try {
    console.log('📸 Fetching featured moodboards...')

    const moodboards = await prisma.moodboard.findMany({
      where: { isFeatured: true, isPublished: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { tags: true } // ✅ no products included
    })

    const data = moodboards.map(normalizeMoodboard)

    res.json({ data }) // ✅ wrapped in "data" for consistency
  } catch (err) {
    console.error('❌ Featured moodboards error:', err)
    res.status(500).json({ error: 'Failed to fetch featured moodboards' })
  }
}



/**
 * GET /moodboards/slug/:slug
 * Returns a single moodboard by slug.
 */
export const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    console.log('🔎 Fetching moodboard by slug:', slug)

    const moodboard = await prisma.moodboard.findFirst({
      where: { slug },
      include: {
        tags: true,
        products: {
          include: { product: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    if (!moodboard) {
      return res.status(404).json({ error: 'Moodboard not found' })
    }

    // ✅ return object directly instead of wrapping in { data: ... }
    res.json(normalizeMoodboard(moodboard))
  } catch (err) {
    console.error('❌ Moodboard by slug error:', err)
    res.status(500).json({ error: 'Failed to fetch moodboard by slug' })
  }
}




/**
 * GET /moodboards/:id
 * Returns a single moodboard by ID.
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params
    console.log('🔍 Fetching moodboard by ID:', id)

    const moodboard = await prisma.moodboard.findUnique({
      where: { id },
      include: {
        tags: true,
        products: {
          include: { product: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    if (!moodboard) {
      return res.status(404).json({ error: 'Moodboard not found' })
    }

    // ✅ Return normalized object directly
    res.json(normalizeMoodboard(moodboard))
  } catch (err) {
    console.error('❌ Moodboard by ID error:', err)
    res.status(500).json({ error: 'Failed to fetch moodboard' })
  }
}



export const getTags = async (req, res) => {
  try {
    console.log('🏷️ Fetching distinct moodboard tags...')
    const tags = await prisma.moodboardTag.findMany({
      distinct: ['tag'],
      select: { tag: true }
    })
    res.json({ data: tags.map(t => t.tag) })
  } catch (err) {
    console.error('❌ Moodboard tags error:', err)
    res.status(500).json({ error: 'Failed to fetch moodboard tags' })
  }     
}

export const getProductsForMoodboard = async (req, res) => {
  try {
    const { id } = req.params
    console.log('🛍️ Fetching products for moodboard:', id)

    // Verify moodboard exists
    const moodboard = await prisma.moodboard.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!moodboard) {
      return res.status(404).json({ error: 'Moodboard not found' })
    }

    // ✅ Fetch products linked to the moodboard via join table
    const products = await prisma.moodboardProduct.findMany({
      where: { moodboardId: id },
      include: {
        product: true
      },
      orderBy: { sortOrder: 'asc' }
    })

    // ✅ Extract normalized product list
    const result = products.map(p => ({
      ...p.product,
      sortOrder: p.sortOrder
    }))

    res.json(result)
  } catch (err) {
    console.error('❌ Moodboard products error:', err)
    res.status(500).json({ error: 'Failed to fetch moodboard products' })
  }
}

