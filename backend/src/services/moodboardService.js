import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getMoodboardList({ search, tag, sortBy, limit, skip, user }) {
  const where = {
    ...(tag ? { tags: { some: { tag } } } : {}),
    ...(search ? { title: { contains: search, mode: 'insensitive' } } : {})
  }
  const [data, total] = await Promise.all([
    prisma.moodboard.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: 'desc' } : { createdAt: 'desc' },
      include: { tags: true, products: true }
    }),
    prisma.moodboard.count({ where })
  ])
  return { data, total }
}

export async function getFeaturedMoodboards(limit, user) {
  return prisma.moodboard.findMany({
    where: { isFeatured: true },
    take: limit || 5,
    orderBy: { createdAt: 'desc' },
    include: { tags: true }
  })
}

export async function getMoodboardBySlug(slug) {
  console.log("Fetching moodboard with slug:", slug);
  return prisma.moodboard.findUnique({
    where: { slug },
    include: { tags: true, products: true }
  })
}

export async function getMoodboardById(id) {
  return prisma.moodboard.findUnique({
    where: { id },
    include: { tags: true, products: true }
  })
}

export async function getRelatedMoodboards(base, limit = 4) {
  return prisma.moodboard.findMany({
    where: {
      id: { not: base.id },
      tags: { some: { tag: { in: base.tags.map(t => t.tag) } } }
    },
    take: limit,
    include: { tags: true, products: true }
  })
}

export async function getDistinctTags() {
  return prisma.moodboardTag.findMany({
    distinct: ['tag'],
    select: { tag: true }
  })
}
