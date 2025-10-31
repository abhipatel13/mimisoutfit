// src/middleware/eventLogger.js
import { logEventAfterResponse } from '../lib/analytics.js'

export async function eventLogger(req, res, next) {
  try {
    const method = req.method.toUpperCase()
    const path = req.originalUrl
    // --------------------------------------------------
    // 🧱 1. Skip non-GET requests (create/update/delete)
    // --------------------------------------------------
    if (method !== 'GET') return next()

    // --------------------------------------------------
    // 🚫 2. Skip authentication & admin CRUD endpoints
    // --------------------------------------------------
    const skipPatterns = [
      /^\/admin\/auth/i,      // login/register/logout
      /^\/admin(\/|$)/i,      // all admin CRUD
      /^\/api\/analytics/i,   // analytics tracker
    ]
    if (skipPatterns.some((re) => re.test(path))) return next()

    // --------------------------------------------------
    // ✅ 3. Proceed only for GET endpoints (public reads)
    // --------------------------------------------------
    const eventType = req.headers['x-event-type']
    const userId = req.headers['x-user-id']
    if (!eventType || !userId) return next()

    const event = {
      userId,
      eventType,
      eventData: req.body || {},
      productId: req.headers['x-product-id'] || null,
      moodboardId: req.headers['x-moodboard-id'] || null,
      sessionId: req.headers['x-session-id'] || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers['referer'],
      url: req.originalUrl,
    }


    // Non-blocking logging after response is finished
    res.on('finish', () => {
      logEventAfterResponse(event).catch((err) =>
        console.warn('Analytics logging failed:', err)
      )
    })
  } catch (err) {
    console.warn('Analytics logging setup failed:', err?.message || err)
  } finally {
    next()
  }
}
