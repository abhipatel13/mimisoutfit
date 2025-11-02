import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Create Product
export const createProduct = async (req, res) => {
  try {
    const { tags, ...productData } = req.body
    
    // Only include tags if array is non-empty, using Prisma's nested create syntax
    const createData = {
      ...productData,
      ...(tags && Array.isArray(tags) && tags.length > 0
        ? { tags: { create: tags.map(tag => ({ tag })) } }
        : {})
    }
    
    const product = await prisma.product.create({
      data: createData,
      include: { tags: true }
    })
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
    const { tags, ...productData } = req.body
    
    // Handle tags: delete existing and create new ones if provided
    const updateData = {
      ...productData,
      ...(tags !== undefined && Array.isArray(tags)
        ? {
            tags: {
              deleteMany: {}, // Delete all existing tags
              ...(tags.length > 0 ? { create: tags.map(tag => ({ tag })) } : {}) // Create new tags if any
            }
          }
        : {})
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { tags: true }
    })
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
