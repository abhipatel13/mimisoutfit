// lib/safeAnalytics.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export function logEventSafe(req, partial = {}) {
  // Detach async context — never await or tie to Express response
  setImmediate(async () => {
    try {
      const userId = req.user?.id || req.headers['x-user-id'] || null
      const eventType = partial.eventType || req.headers['x-event-type']
      if (!eventType) return // nothing to log

      await prisma.analyticsEvent.create({
        data: {
          userId,
          eventType,
          productId: partial.productId || null,
          resourceType: partial.resourceType || null,
          resourceId: partial.resourceId || null,
          resourceName: partial.resourceName || null,
          metadata: partial.metadata || null,
          ipAddress: req.ip,
          userAgent: req.get('user-agent') || null
        }
      })
    } catch (err) {
      // never bubble up to Express
      console.error('Analytics helper error (suppressed):', err.message)
    }
  })
}
