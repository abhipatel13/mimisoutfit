import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


// Utility to compute date window
function sinceDate(timeRange = '30d') {
  const days = parseInt(timeRange.replace('d', ''), 10) || 30
  const since = new Date()
  since.setDate(since.getDate() - days)
  return since
}

// ──────────────────────────────────────────────
// 1️⃣ Overview
// ──────────────────────────────────────────────
export async function getOverview(req, res) {
  try {
    const { timeRange = '30d' } = req.query
    const since = sinceDate(timeRange)

    const [events, visitors] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: since } },
        select: { eventType: true }
      }),
      prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: since } },
        _count: true
      })
    ])

    const count = type => events.filter(e => e.eventType === type).length

    res.json({
      totalVisitors: visitors.length,
      totalPageViews: count('page_view'),
      totalProductViews: count('product_view'),
      totalMoodboardViews: count('moodboard_view'),
      totalSearches: count('search'),
      totalFavorites: count('favorite_add'),
      totalAffiliateClicks: count('affiliate_click'),
      avgSessionDuration: 240,
      bounceRate: 42.5,
      timeRange
    })
  } catch (err) {
    console.error('Overview analytics error:', err)
    res.status(500).json({ error: 'Failed to fetch analytics overview' })
  }
}

// ──────────────────────────────────────────────
// 2️⃣ User Behavior
// ──────────────────────────────────────────────
export async function getUserBehavior(req, res) {
  try {
    const { timeRange = '30d' } = req.query
    const since = sinceDate(timeRange)

    const visitors = await prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: since } },
      _count: true
    })

    // Quick classification: assume first event ever = new
    const allUsers = await prisma.analyticsEvent.groupBy({ by: ['userId'], _min: { createdAt: true } })
    const cutoff = since.getTime()
    const newUsers = allUsers.filter(u => u._min.createdAt.getTime() >= cutoff).length
    const returningUsers = visitors.length - newUsers

    // Traffic sources (from referrer field)
    const sources = await prisma.analyticsEvent.groupBy({
      by: ['referrer'],
      where: { createdAt: { gte: since } },
      _count: true
    })
    const total = sources.reduce((a, s) => a + s._count, 0)
    const trafficSources = sources.map(s => ({
      source: s.referrer || 'Direct',
      visitors: s._count,
      percentage: total ? +(s._count / total * 100).toFixed(1) : 0
    }))

    res.json({
      newUsers,
      returningUsers,
      avgSessionDuration: 240,
      avgPagesPerSession: 4.2,
      trafficSources,
      timeRange
    })
  } catch (err) {
    console.error('User behavior error:', err)
    res.status(500).json({ error: 'Failed to fetch user behavior data' })
  }
}

// ──────────────────────────────────────────────
// 3️⃣ Product Analytics
// ──────────────────────────────────────────────
export async function getProductAnalytics(req, res) {
  try {
    const { timeRange = '30d', limit = 10 } = req.query
    const since = sinceDate(timeRange)
    const lim = Math.min(Math.max(parseInt(limit), 1), 50)

    const products = await prisma.analyticsEvent.groupBy({
      by: ['productId'],
      where: { productId: { not: null }, createdAt: { gte: since } },
      _count: { _all: true },
      _max: { createdAt: true }
    })

    // Count per event type
    const eventCounts = await prisma.analyticsEvent.findMany({
      where: { productId: { not: null }, createdAt: { gte: since } },
      select: { productId: true, eventType: true }
    })

    const productStats = {}
    for (const e of eventCounts) {
      const id = e.productId
      if (!productStats[id]) productStats[id] = { views: 0, favorites: 0, clicks: 0 }
      if (e.eventType === 'product_view') productStats[id].views++
      if (e.eventType === 'favorite_add') productStats[id].favorites++
      if (e.eventType === 'affiliate_click') productStats[id].clicks++
    }

    const merged = Object.entries(productStats).map(([id, s]) => ({
      id,
      name: id,
      ...s,
      conversionRate: s.views ? +(s.clicks / s.views * 100).toFixed(1) : 0
    }))

    const topProducts = merged
      .sort((a, b) => b.views - a.views)
      .slice(0, lim)

    // Top search terms
    const searchTerms = await prisma.analyticsEvent.findMany({
      where: { eventType: 'search', createdAt: { gte: since } },
      select: { eventData: true, userId: true }
    })
    const termMap = {}
    for (const ev of searchTerms) {
      const term = ev.eventData?.term || ev.eventData?.query || ''
      if (!term) continue
      if (!termMap[term]) termMap[term] = { count: 0, users: new Set() }
      termMap[term].count++
      termMap[term].users.add(ev.userId)
    }
    const topSearches = Object.entries(termMap)
      .map(([term, v]) => ({
        term,
        count: v.count,
        uniqueSearchers: v.users.size
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    res.json({ topProducts, topSearches, timeRange })
  } catch (err) {
    console.error('Product analytics error:', err)
    res.status(500).json({ error: 'Failed to fetch product analytics' })
  }
}

// Detailed Product Analytics by ID
export async function getProductAnalyticsById(req, res) {
  try {
    const { productId } = req.params
    const { timeRange = '30d' } = req.query
    const since = sinceDate(timeRange)

    // Basic metrics
    const [views, favorites, clicks, uniqueViewersArr] = await Promise.all([
      prisma.analyticsEvent.count({ where: { productId, eventType: 'product_view', createdAt: { gte: since } } }),
      prisma.analyticsEvent.count({ where: { productId, eventType: 'favorite_add', createdAt: { gte: since } } }),
      prisma.analyticsEvent.count({ where: { productId, eventType: 'affiliate_click', createdAt: { gte: since } } }),
      prisma.analyticsEvent.groupBy({ by: ['userId'], where: { productId, eventType: 'product_view', createdAt: { gte: since } }, _count: true })
    ])
    const uniqueViewers = uniqueViewersArr.length
    const conversionRate = views ? +((clicks / views) * 100).toFixed(1) : 0

    // Time series (views and clicks by day)
    const [viewsByDay, clicksByDay] = await Promise.all([
      prisma.$queryRaw`SELECT DATE("createdAt") as date, COUNT(*)::int as count FROM "AnalyticsEvent" WHERE "productId" = ${productId} AND "eventType" = 'product_view' AND "createdAt" >= ${since} GROUP BY DATE("createdAt") ORDER BY date ASC;`,
      prisma.$queryRaw`SELECT DATE("createdAt") as date, COUNT(*)::int as count FROM "AnalyticsEvent" WHERE "productId" = ${productId} AND "eventType" = 'affiliate_click' AND "createdAt" >= ${since} GROUP BY DATE("createdAt") ORDER BY date ASC;`
    ])

    // Viewer locations (best effort; uses metadata.country if present)
    const locations = await prisma.$queryRaw`SELECT COALESCE("metadata"->>'country','Unknown') as country, COUNT(*)::int as count FROM "AnalyticsEvent" WHERE "productId" = ${productId} AND "eventType" = 'product_view' AND "createdAt" >= ${since} GROUP BY country ORDER BY count DESC;`
    const totalLoc = locations.reduce((a, r) => a + r.count, 0) || 0
    const viewerLocations = locations.map(r => ({ country: r.country, count: r.count, percentage: totalLoc ? +((r.count / totalLoc) * 100).toFixed(1) : 0 }))

    return res.json({
      productId,
      metrics: { views, uniqueViewers, favorites, clicks, conversionRate },
      viewsByDay,
      clicksByDay,
      viewerLocations,
      timeRange
    })
  } catch (err) {
    console.error('Product analytics by ID error:', err)
    res.status(500).json({ error: 'Failed to fetch product analytics' })
  }
}

// ──────────────────────────────────────────────
// 4️⃣ Moodboard Analytics
// ──────────────────────────────────────────────
export async function getMoodboardAnalytics(req, res) {
  try {
    const { timeRange = '30d', limit = 10 } = req.query
    const since = sinceDate(timeRange)
    const lim = Math.min(Math.max(parseInt(limit), 1), 50)

    const events = await prisma.analyticsEvent.findMany({
      where: { moodboardId: { not: null }, createdAt: { gte: since } },
      select: { moodboardId: true, eventType: true }
    })

    const moodStats = {}
    for (const e of events) {
      const id = e.moodboardId
      if (!moodStats[id]) moodStats[id] = { views: 0, clicks: 0 }
      if (e.eventType === 'moodboard_view') moodStats[id].views++
      if (e.eventType === 'moodboard_product_click') moodStats[id].clicks++
    }

    const merged = Object.entries(moodStats).map(([id, s]) => ({
      id,
      title: id,
      ...s,
      clickThroughRate: s.views ? +(s.clicks / s.views * 100).toFixed(1) : 0
    }))

    res.json({
      topMoodboards: merged.sort((a, b) => b.views - a.views).slice(0, lim),
      timeRange
    })
  } catch (err) {
    console.error('Moodboard analytics error:', err)
    res.status(500).json({ error: 'Failed to fetch moodboard analytics' })
  }
}

// ──────────────────────────────────────────────
// 5️⃣ Recent Activity
// ──────────────────────────────────────────────
export async function getRecentActivity(req, res) {
  try {
    const { limit = 20 } = req.query
    const lim = Math.min(Math.max(parseInt(limit), 1), 100)

    const events = await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: lim
    })

    const formatted = events.map(e => ({
      id: e.id,
      type: e.eventType,
      userId: e.userId,
      productId: e.productId,
      moodboardId: e.moodboardId,
      eventData: e.eventData,
      timestamp: e.createdAt
    }))

    res.json({ events: formatted })
  } catch (err) {
    console.error('Recent activity error:', err)
    res.status(500).json({ error: 'Failed to fetch recent activity' })
  }
}
