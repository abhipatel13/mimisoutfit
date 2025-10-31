// src/middleware/globalGetLogger.js
import { logEventAfterResponse } from '../lib/analytics.js'

export function globalGetLogger(req, res, next) {
  try {
    // Only apply to GET requests
    if (req.method.toUpperCase() !== 'GET') return next()

    // Preserve start time for duration if needed
    const startTime = Date.now()

    // Fire after response is sent
    res.on('finish', async () => {
      try {
        const partial = req.analyticsPartial || {}

        const data = {
          userId: partial.userId || req.headers['x-user-id'] || 'anonymous',
          eventType: partial.eventType || 'page_view',
          eventData: partial.eventData || {},
          productId: partial.productId ?? null,
          moodboardId: partial.moodboardId ?? null,
          sessionId: partial.sessionId || req.headers['x-session-id'] || null,
          ipAddress: partial.ipAddress || req.ip,
          userAgent: partial.userAgent || req.headers['user-agent'],
          referrer: partial.referrer || req.headers['referer'] || null,
          resourceType: partial.resourceType || null,
          resourceId: partial.resourceId || null,
          resourceName: partial.resourceName || null,
          metadata: partial.metadata || null,
          url: partial.url || req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - startTime
        }

        // Async, non-blocking logging
        await logEventAfterResponse(data)
      } catch (err) {
        console.warn('GET event logging failed:', err.message)
      }
    })
  } catch (err) {
    console.warn('GET logger middleware setup failed:', err.message)
  } finally {
    next()
  }
}
