import bcrypt from 'bcrypt'
import prisma from '../../lib/prisma.js'

export async function createUser(req, res) {
  try {
    const { email, password, name, role } = req.body

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' })

    const existing = await prisma.adminUser.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'User already exists' })

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.adminUser.create({
      data: {
        email,
        passwordHash: hashed,
        name: name || '',
        role: role || 'admin'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return res.status(201).json(user)
  } catch (err) {
    console.error('Create user error:', err)
    if (!res.headersSent)
      res.status(500).json({ error: 'Failed to create user' })
  }
}
