import NodeCache from 'node-cache'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const cache = new NodeCache({ stdTTL: 300 }) // 5 min TTL

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const sinceDate = (timeRange = '30d') => {
  const days = parseInt(timeRange.replace('d', ''), 10) || 30
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

// ──────────────────────────────────────────────
// Rate Limiter for /analytics/track
// ──────────────────────────────────────────────
export const trackLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  limit: 100,
  message: { error: 'Rate limit exceeded' }
})

// ──────────────────────────────────────────────
// POST /analytics/track – Frontend batch ingestion
// ──────────────────────────────────────────────
export async function trackEvents(req, res) {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body]
    const mapped = events.map(e => ({
      userId: e.userId || 'anonymous',
      eventType: e.eventType || e.event,
      resourceType: e.resourceType || null,
      resourceId: e.resourceId || null,
      resourceName: e.resourceName || null,
      metadata: e.metadata || {},
      productId: e.productId || null,
      moodboardId: e.moodboardId || null,
      sessionId: e.sessionId || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: e.referrer || req.headers['referer'] || null,
      url: e.url || null
    }))
    await prisma.analyticsEvent.createMany({ data: mapped })
    res.json({ success: true, inserted: mapped.length })
  } catch (err) {
    console.error('track error', err)
    res.status(500).json({ error: 'Failed to store events' })
  }
}

// ──────────────────────────────────────────────
// GET /admin/analytics/timeseries
// ──────────────────────────────────────────────
export async function getTimeSeries(req, res) {
  const { timeRange = '30d' } = req.query
  const since = sinceDate(timeRange)
  const cacheKey = `ts-multi-${timeRange}`
  const cached = cache.get(cacheKey)
  if (cached) return res.json(cached)

  const rows = await prisma.$queryRaw`
    WITH daily AS (
      SELECT DATE("createdAt") as date,
             SUM(CASE WHEN "eventType" = 'product_view' THEN 1 ELSE 0 END)::int as views,
             SUM(CASE WHEN "eventType" = 'affiliate_click' THEN 1 ELSE 0 END)::int as clicks,
             SUM(CASE WHEN "eventType" = 'search' THEN 1 ELSE 0 END)::int as searches,
             SUM(CASE WHEN "eventType" = 'favorite_add' THEN 1 ELSE 0 END)::int as favorites,
             COUNT(DISTINCT CASE WHEN "eventType" IN ('page_view','product_view','moodboard_view','search') THEN "userId" END)::int as visitors
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
    )
    SELECT date, views, clicks, searches, favorites, visitors
    FROM daily
    ORDER BY date ASC;
  `
  const payload = rows.map(r => ({
    date: r.date,
    views: Number(r.views) || 0,
    clicks: Number(r.clicks) || 0,
    searches: Number(r.searches) || 0,
    favorites: Number(r.favorites) || 0,
    visitors: Number(r.visitors) || 0
  }))
  const response = { timeRange, data: payload }
  cache.set(cacheKey, response)
  res.json(response)
}

// ──────────────────────────────────────────────
// GET /admin/analytics/categories
// ──────────────────────────────────────────────
export async function getCategories(req, res) {
  const { timeRange = '30d' } = req.query
  const since = sinceDate(timeRange)
  const cacheKey = `cat-${timeRange}`
  const cached = cache.get(cacheKey)
  if (cached) return res.json(cached)

  // Click distribution by product category (based on affiliate_click)
  const rows = await prisma.$queryRaw`
    SELECT COALESCE(p.category, 'Unknown') as category,
           COUNT(*)::int as count
    FROM "AnalyticsEvent" e
    LEFT JOIN products p ON p.id = e."productId"
    WHERE e."eventType" = 'affiliate_click' AND e."createdAt" >= ${since}
    GROUP BY category
    ORDER BY count DESC;
  `
  const total = rows.reduce((a, r) => a + Number(r.count), 0) || 0
  const data = rows.map(r => ({
    category: r.category,
    count: Number(r.count),
    percentage: total ? +((Number(r.count) / total) * 100).toFixed(1) : 0
  }))
  const resp = { timeRange, data }
  cache.set(cacheKey, resp)
  res.json(resp)
}

// ──────────────────────────────────────────────
// GET /admin/analytics/funnel
// ──────────────────────────────────────────────
export async function getFunnel(req, res) {
  const { timeRange = '30d' } = req.query
  const since = sinceDate(timeRange)
  const steps = [
    { key: 'page_view', label: 'Visitors' },
    { key: 'product_view', label: 'Product Views' },
    { key: 'favorite_add', label: 'Favorites' },
    { key: 'affiliate_click', label: 'Affiliate Clicks' }
  ]
  const counts = {}
  for (const s of steps) {
    // page_view approximates sessions/visitors; adjust as needed
    if (s.key === 'page_view') {
      const distinct = await prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: since } },
        _count: true
      })
      counts[s.key] = distinct.length
    } else {
      counts[s.key] = await prisma.analyticsEvent.count({ where: { eventType: s.key, createdAt: { gte: since } } })
    }
  }

  const data = steps.map((s, i) => {
    const count = counts[s.key] || 0
    const prev = i === 0 ? count : counts[steps[i - 1].key] || 0
    const conversionRate = prev ? +((count / prev) * 100).toFixed(1) : 0
    const dropOffRate = +(100 - conversionRate).toFixed(1)
    return { stage: s.label, count, conversionRate, dropOffRate }
  })

  res.json(data)
}

// ──────────────────────────────────────────────
// GET /admin/analytics/trends
// ──────────────────────────────────────────────
export async function getTrends(req, res) {
  const { timeRange = '30d' } = req.query
  const days = parseInt(timeRange.replace('d', ''), 10)
  const since = sinceDate(timeRange)
  const prevSince = sinceDate(`${days * 2}d`)
  const prevEnd = since

  // Compute current and previous for multiple metrics
  const compute = async (whereCurrent, wherePrev) => {
    const [cur, prev] = await Promise.all([
      prisma.analyticsEvent.count({ where: whereCurrent }),
      prisma.analyticsEvent.count({ where: wherePrev })
    ])
    const change = cur - prev
    const changePercentage = prev ? +(((cur - prev) / prev) * 100).toFixed(1) : null
    const trend = changePercentage == null ? 'flat' : changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'flat'
    return { current: cur, previous: prev, change, changePercentage, trend }
  }

  const [views, clicks, favorites, visitors] = await Promise.all([
    compute(
      { eventType: 'product_view', createdAt: { gte: since } },
      { eventType: 'product_view', createdAt: { gte: prevSince, lt: prevEnd } }
    ),
    compute(
      { eventType: 'affiliate_click', createdAt: { gte: since } },
      { eventType: 'affiliate_click', createdAt: { gte: prevSince, lt: prevEnd } }
    ),
    compute(
      { eventType: 'favorite_add', createdAt: { gte: since } },
      { eventType: 'favorite_add', createdAt: { gte: prevSince, lt: prevEnd } }
    ),
    // Distinct visitors (approximation via product/page/moodboard views + search)
    (async () => {
      const cur = await prisma.analyticsEvent.groupBy({ by: ['userId'], where: { createdAt: { gte: since } }, _count: true })
      const prev = await prisma.analyticsEvent.groupBy({ by: ['userId'], where: { createdAt: { gte: prevSince, lt: prevEnd } }, _count: true })
      const result = {
        current: cur.length,
        previous: prev.length,
        change: cur.length - prev.length,
        changePercentage: prev.length ? +(((cur.length - prev.length) / prev.length) * 100).toFixed(1) : null,
        trend: prev.length ? (cur.length > prev.length ? 'up' : cur.length < prev.length ? 'down' : 'flat') : 'flat'
      }
      return result
    })()
  ])

  res.json([
    { metric: 'Views', ...views },
    { metric: 'Clicks', ...clicks },
    { metric: 'Favorites', ...favorites },
    { metric: 'Visitors', ...visitors }
  ])
}
