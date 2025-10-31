// src/services/productService.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Safe execution wrapper.
 * Ensures async DB calls never reject to the router.
 * Returns null on error and logs internally.
 */
async function safeExec(label, fn) {
  try {
    return await fn()
  } catch (err) {
    console.error(`🔥 ${label} failed:`, err)
    return null
  }
}

/* ============================================================
 * 1️⃣ SEARCH PRODUCTS (full-text SQL query)
 * ============================================================ */
export async function searchProducts({ search, category, brand, minPrice, maxPrice, sortBy, limit, skip, user }) {
  let paramIndex = 1
  const params = [search]
  let whereClauses = `
    WHERE to_tsvector('english', p.name || ' ' || COALESCE(p.brand,'') || ' ' || COALESCE(p.description,'')) 
      @@ plainto_tsquery('english', $${paramIndex})
  `

  if (category) {
    paramIndex++
    params.push(category)
    whereClauses += ` AND p.category = $${paramIndex}`
  }

  if (brand) {
    paramIndex++
    params.push(brand)
    whereClauses += ` AND p.brand = $${paramIndex}`
  }

  if (minPrice || maxPrice) {
    const minVal = Number(minPrice) || 0
    const maxVal = Number(maxPrice) || 99999
    paramIndex++
    params.push(minVal)
    paramIndex++
    params.push(maxVal)
    whereClauses += ` AND p.price BETWEEN $${paramIndex - 1} AND $${paramIndex}`
  }

  if (!user) whereClauses += ` AND p.is_published = TRUE`

  paramIndex++
  params.push(Number(limit))
  const limitPlaceholder = `$${paramIndex}`
  paramIndex++
  params.push(Number(skip))
  const offsetPlaceholder = `$${paramIndex}`

  const query = `
    SELECT 
      p.*,
      ARRAY_REMOVE(ARRAY_AGG(pt.tag), NULL) AS tags,
      ts_rank_cd(
        to_tsvector('english', p.name || ' ' || COALESCE(p.brand,'') || ' ' || COALESCE(p.description,'')),
        plainto_tsquery('english', $1)
      ) AS rank,
      ts_headline('english', p.name, plainto_tsquery('english', $1),
                  'StartSel=<b>, StopSel=</b>, MaxWords=30, MinWords=5, ShortWord=3, HighlightAll=TRUE') AS name_highlight,
      ts_headline('english', p.description, plainto_tsquery('english', $1),
                  'StartSel=<b>, StopSel=</b>, MaxWords=50, MinWords=5, ShortWord=3, HighlightAll=TRUE') AS description_highlight
    FROM products p
    LEFT JOIN product_tags pt ON p.id = pt.product_id
    ${whereClauses}
    GROUP BY p.id
    ORDER BY ${sortBy === 'newest' ? 'p.created_at DESC' : 'rank DESC'}
    LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder};
  `

  const data = await safeExec('Full-text search query', () =>
    prisma.$queryRawUnsafe(query, ...params)
  )

  const totalQuery = `SELECT COUNT(*) FROM products p ${whereClauses};`
  const totalResult = await safeExec('Full-text count query', () =>
    prisma.$queryRawUnsafe(totalQuery, ...params.slice(0, paramIndex - 2))
  )

  // ✅ Normalize tags to a JS array of strings
  const normalizedData = (data || []).map(p => ({
    ...p,
    tags: Array.isArray(p.tags)
      ? p.tags
      : typeof p.tags === 'string'
        ? p.tags.replace(/[{}"]/g, '').split(',').filter(Boolean)
        : []
  }))

  return {
    data: normalizedData,
    total: Number(totalResult?.[0]?.count || 0)
  }
}


/* ============================================================
 * 2️⃣ GET PRODUCT LIST (filtered ORM query)
 * ============================================================ */
export async function getProductList({ category, brand, tag, minPrice, maxPrice, sortBy, limit, skip, user }) {
  const where = {
    ...(category && { category }),
    ...(brand && { brand }),
    ...(tag && { tags: { some: { tag: { equals: tag, mode: 'insensitive' } } } }),
    ...(minPrice || maxPrice
      ? { price: { gte: Number(minPrice) || 0, lte: Number(maxPrice) || 99999 } }
      : {}),
    ...(!user ? { isPublished: true } : {})
  }

  const [total, products] = await Promise.all([
    safeExec('Product count', () => prisma.product.count({ where })),
    safeExec('Product list', () =>
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { tags: true },
        orderBy:
          sortBy === 'price-low'
            ? { price: 'asc' }
            : sortBy === 'price-high'
            ? { price: 'desc' }
            : { createdAt: 'desc' }
      })
    )
  ])

  // ✅ Normalize tags to array of strings
  const normalizedProducts = (products || []).map(p => ({
    ...p,
    tags: p.tags?.map(t => t.tag) || [] // assuming each tag object has a "tag" field
  }))

  return {
    products: normalizedProducts,
    total: total || 0
  }
}


/* ============================================================
 * 3️⃣ FEATURED PRODUCTS
 * ============================================================ */
export async function getFeaturedProducts(limit) {
  return await safeExec('Featured products', () =>
    prisma.product.findMany({
      where: { isFeatured: true,  isPublished: true  },
      ...(limit > 0 ? { take: limit } : {}),
      orderBy: { createdAt: 'desc' },
      include: { tags: true }
    })
  )
}

/* ============================================================
 * 4️⃣ PRODUCT BY SLUG
 * ============================================================ */
export async function getProductBySlug(slug) {
  return await safeExec('Product by slug', () =>
    prisma.product.findUnique({
      where: { slug },
      include: { tags: true }
    })
  )
}

/* ============================================================
 * 5️⃣ PRODUCT BY ID
 * ============================================================ */
export async function getProductById(id) {
  return await safeExec('Product by ID', () =>
    prisma.product.findUnique({
      where: { id },
      include: { tags: true }
    })
  )
}

/* ============================================================
 * 6️⃣ RELATED PRODUCTS (based on moodboard relationships)
 * Returns all products from moodboards that contain this product
 * ============================================================ */
export async function getRelatedProducts(base, limit, user) {
  if (!base?.id) return []

  return await safeExec('Related products from moodboards', async () => {
    // Step 1: Find all moodboards that contain this product
    const moodboardProducts = await prisma.moodboardProduct.findMany({
      where: { productId: base.id },
      select: { moodboardId: true }
    })

    const moodboardIds = moodboardProducts.map(mp => mp.moodboardId)
    if (moodboardIds.length === 0) return []

    // Step 2: Find all products in those moodboards (excluding the current product)
    const relatedProductIds = await prisma.moodboardProduct.findMany({
      where: {
        moodboardId: { in: moodboardIds },
        productId: { not: base.id }
      },
      select: { productId: true },
      distinct: ['productId'] // Remove duplicates
    })

    const uniqueProductIds = relatedProductIds.map(r => r.productId)
    if (uniqueProductIds.length === 0) return []

    // Step 3: Fetch the products with tags
    const products = await prisma.product.findMany({
      where: {
        id: { in: uniqueProductIds },
        ...(user ? {} : { isPublished: true })
      },
      include: { tags: true },
      orderBy: { createdAt: 'desc' },
      take: limit || 20
    })

    return products
  })
}

/* ============================================================
 * 7️⃣ DISTINCT LISTS (brands, categories, tags)
 * ============================================================ */
export async function getDistinctBrands() {
  const rows = await safeExec('Distinct brands', () =>
    prisma.product.findMany({
      where: { brand: { not: null } },
      distinct: ['brand'],
      select: { brand: true }
    })
  )
  return rows || []
}

export async function getDistinctCategories() {
  const rows = await safeExec('Distinct categories', () =>
    prisma.product.findMany({
      where: { category: { not: null } },
      distinct: ['category'],
      select: { category: true }
    })
  )
  return rows || []
}

export async function getDistinctTags() {
  const rows = await safeExec('Distinct tags', () =>
    prisma.productTag.findMany({
      distinct: ['tag'],
      select: { tag: true }
    })
  )
  return rows || []
}
