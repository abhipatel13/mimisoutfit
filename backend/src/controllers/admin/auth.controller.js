import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

function safeSignToken(user) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('❌ Missing JWT_SECRET')
    return null
  }

  try {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1d' }
    )
  } catch (e) {
    console.error('❌ signToken failed:', e)
    return null
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body

    const user = await prisma.adminUser.findFirst({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (!password || !user.passwordHash)
      return res.status(400).json({ message: 'Missing credentials or password hash' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = safeSignToken(user)
    if (!token) return res.status(500).json({ message: 'Token generation failed' })

    // ✅ send once and immediately exit
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, token })
    return // <-- exit the function right here
  } catch (err) {
    if (res.headersSent) {
      console.error('❌ Post-response error ignored:', err)
      return
    }
    console.error('Login error before response:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
