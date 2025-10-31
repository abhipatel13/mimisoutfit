import {
  searchProducts,
  getProductList,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  getRelatedProducts,
  getDistinctBrands,
  getDistinctCategories,
  getDistinctTags
} from '../services/productService.js'
import { logEventSafe } from '../lib/safeAnalytics.js'
import { CONFIG } from '../lib/config.js'
import { fetchFeaturedMoodboards } from '../controllers/moodboards.controller.js'

// -------------------------------------------
// Helpers
// -------------------------------------------
function runAsyncDetached(fn, label = 'Detached task') {
  try {
    Promise.resolve(fn()).catch(err => console.warn(`⚠️ ${label} failed:`, err))
  } catch (err) {
    console.warn(`⚠️ ${label} sync failed:`, err)
  }
}

function handleError(res, label, err) {
  console.error(`❌ ${label}:`, err)
  if (!res.headersSent) res.status(500).json({ error: 'Internal server error' })
}

function sendJson(res, data) {
  if (!res.headersSent) res.json(data)
}

// -------------------------------------------
// Controller functions
// -------------------------------------------
export const listProducts = async (req, res) => {
  console.log('🧠 listProducts hit:', req.query)

  try {
    const { search, category, brand, tag, minPrice, maxPrice, sortBy } = req.query

    // ensure numeric conversion
    const pageNum = parseInt(req.query.page, 10) || 1
    const limitNum = parseInt(req.query.limit, 10) || 12
    const skip = (pageNum - 1) * limitNum

    let data, total

    if (search) {
      const result = await searchProducts({
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        sortBy,
        limit: limitNum,  // ✅ use number
        skip,
        user: req.user
      })
      if (!result) return res.status(500).json({ error: 'Query failed' })
      data = result.data
      total = result.total
    } else {
      const result = await getProductList({
        category,
        brand,
        tag,
        minPrice,
        maxPrice,
        sortBy,
        limit: limitNum,  // ✅ use number
        skip,
        user: req.user
      })
      if (!result) return res.status(500).json({ error: 'Query failed' })
      data = result.products
      total = result.total
    }

    // Normalize price to number for all products
    const normalized = data.map(p => ({ ...p, price: p.price ? Number(p.price) : null }))

    // ✅ consistent numeric pagination
    sendJson(res, {
      data: normalized,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      }
    })
  } catch (err) {
    handleError(res, 'Search error', err)
  }
}

export const getHomeFeatured = async (req, res) => {
  try {
    const [moodboards, products] = await Promise.all([
      fetchFeaturedMoodboards(3),
      getFeaturedProducts(5)
    ])

    // Normalize products like in getFeatured
    const normalizedProducts = (products || []).map(({ createdAt, updatedAt, ...p }) => ({
      ...p,
      price: p.price ? Number(p.price) : null,
      tags: p.tags?.map(t => t.tag) || []
    }))

    sendJson(res, { moodboards, products: normalizedProducts })
  } catch (err) {
    handleError(res, 'Home featured products error', err)
  }
}

export const getFeatured = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 0, 0), 100)
    const products = await getFeaturedProducts(limit, req.user)

    const data = (products || []).map(({ createdAt, updatedAt, ...p }) => ({
      ...p,
      price: p.price ? Number(p.price) : null,
      tags: p.tags?.map(t => t.tag) || [] // assuming each tag object has a "tag" field
    }))

    sendJson(res, { data }) // ✅ clean output without dates
  } catch (err) {
    handleError(res, 'Featured products error', err)
  }
}


export const getBrands = async (_req, res) => {
  try {
    const data = await getDistinctBrands()
    sendJson(res, data?.map(b => b.brand).sort() || [])
  } catch (err) {
    handleError(res, 'Brands error', err)
  }
}

export const getCategories = async (_req, res) => {
  try {
    const data = await getDistinctCategories()
    sendJson(res, data?.map(c => c.category).sort() || [])
  } catch (err) {
    handleError(res, 'Categories error', err)
  }
}

export const getTags = async (_req, res) => {
  try {
    const data = await getDistinctTags()
    sendJson(res, data?.map(t => t.tag).sort() || [])
  } catch (err) {
    handleError(res, 'Tags error', err)
  }
}

export const getBySlug = async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    sendJson(res, {
      ...product,
      price: product.price ? Number(product.price) : null,
      tags: product.tags.map(t => t.tag)
    })

    if (CONFIG.ENABLE_EVENT_LOG && product?.id) {
      runAsyncDetached(() =>
        logEventSafe(req, {
          eventType: 'product_view',
          productId: product.id,
          resourceType: 'product',
          resourceId: product.slug
        }),
        'logEventSafe slug'
      )
    }
  } catch (err) {
    handleError(res, 'Product by slug error', err)
  }
}

export const getById = async (req, res) => {
  try {
    const product = await getProductById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    sendJson(res, {
      ...product,
      price: product.price ? Number(product.price) : null,
      tags: product.tags.map(t => t.tag)
    })

    if (CONFIG.ENABLE_EVENT_LOG && product?.id) {
      runAsyncDetached(() =>
        logEventSafe(req, {
          eventType: 'product_view',
          productId: product.id,
          resourceType: 'product',
          resourceId: product.id
        }),
        'logEventSafe id'
      )
    }
  } catch (err) {
    handleError(res, 'Product by ID error', err)
  }
}

export const getRelated = async (req, res) => {
  try {
    const base = await getProductById(req.params.id)
    if (!base) return res.status(404).json({ error: 'Product not found' })
    const related = await getRelatedProducts(base, 4, req.user)
    const data = (related || []).map(({ createdAt, updatedAt, ...p }) => ({
      ...p,
      price: p.price ? Number(p.price) : null,
      tags: p.tags?.map(t => t.tag) || []
    }))
    sendJson(res, { data })
  } catch (err) {
    handleError(res, 'Related products error', err)
  }
}
