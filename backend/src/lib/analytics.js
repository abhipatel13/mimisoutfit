import prisma from './prisma.js'

/**
 * Safe, single-fire analytics logger
 * Runs AFTER the response has been sent,
 * never attaches more than once per res.
 */
export function logEventAfterResponse(req, res, partial) {
  try {
    // skip if already attached
    if (res.locals._analyticsLogged) return
    res.locals._analyticsLogged = true

    const data = {
      userId: partial.userId || req.headers['x-user-id'] || 'anonymous',
      eventType: partial.eventType,
      eventData: partial.eventData || {},
      productId: partial.productId ?? null,
      moodboardId: partial.moodboardId ?? null,
      sessionId: partial.sessionId || req.headers['x-session-id'] || null,
      ipAddress: partial.ipAddress || req.ip,
      userAgent: partial.userAgent || req.headers['user-agent'],
      referrer: partial.referrer || req.headers['referer'],
      resourceType: partial.resourceType || null,
      resourceId: partial.resourceId || null,
      resourceName: partial.resourceName || null,
      metadata: partial.metadata || null,
      url: partial.url || req.originalUrl
    }

    // ⚡ Run async but never throw
    res.once('finish', async () => {
      try {
        await prisma.analyticsEvent.create({ data })
      } catch (err) {
        console.warn('⚠️ Analytics write failed:', err?.message)
      }
    })
  } catch (err) {
    console.warn('Analytics helper error:', err?.message)
  }
}
