import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Create Product
export const createProduct = async (req, res) => {
  try {
    const data = req.body
    const product = await prisma.product.create({ data })
    res.status(201).json(product)
  } catch (err) {
    console.error('Create product error:', err)
    res.status(500).json({ error: 'Failed to create product' })
  }
}

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const product = await prisma.product.update({ where: { id }, data })
    res.json(product)
  } catch (err) {
    console.error('Update product error:', err)
    res.status(500).json({ error: 'Failed to update product' })
  }
}

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.product.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    console.error('Delete product error:', err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
}

// Publish / Unpublish Product
export const publishProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { publish } = req.body
    const product = await prisma.product.update({
      where: { id },
      data: { isFeatured: publish }
    })
    res.json(product)
  } catch (err) {
    console.error('Publish product error:', err)
    res.status(500).json({ error: 'Failed to update publish status' })
  }
}

// Bulk Publish
export const bulkPublish = async (req, res) => {
  try {
    const { publish } = req.body
    const productIds = Array.isArray(req.body.productIds) ? req.body.productIds : req.body.ids
    const results = await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { isFeatured: publish }
    })
    res.json({ success: true, updated: results.count })
  } catch (err) {
    console.error('Bulk publish error:', err)
    res.status(500).json({ error: 'Failed to bulk update products' })
  }
}

// Bulk Delete
export const bulkDelete = async (req, res) => {
  try {
    const productIds = Array.isArray(req.body.productIds) ? req.body.productIds : req.body.ids
    const results = await prisma.product.deleteMany({
      where: { id: { in: productIds } }
    })
    res.json({ success: true, deleted: results.count })
  } catch (err) {
    console.error('Bulk delete error:', err)
    res.status(500).json({ error: 'Failed to bulk delete products' })
  }
}
