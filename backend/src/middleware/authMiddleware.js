import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing token.' } })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key')
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token.' } })
  }
}

// Best-effort auth: attaches req.user if token is valid, otherwise continues
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    // No token? That’s fine — move on
    req.user = null
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
  } catch (err) {
    console.warn('⚠️ Invalid or expired token:', err.message)
    req.user = null
  }

  // ✅ always proceed to the next middleware/route
  next()
}
