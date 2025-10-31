import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto';

// Event taxonomy and helper lists
const eventTypes = [
  'page_view',
  'product_view',
  'moodboard_view',
  'moodboard_filter',
  'moodboard_product_click',
  'search',
  'favorite_add',
  'favorite_remove',
  'affiliate_click',
  'filter_change',
  'sort_change'
]
const categories = ['Outerwear', 'Dresses', 'Bottoms', 'Knitwear', 'Shoes', 'Accessories']
const referrers = ['google.com', 'instagram.com', 'direct', 'tiktok.com', 'pinterest.com']
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randomIp() { return `${randInt(1, 255)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}` }
function recentDateWithinDays(days) {
  const now = Date.now()
  const past = now - randInt(0, days) * 24 * 60 * 60 * 1000 - randInt(0, 23) * 3600 * 1000 - randInt(0, 59) * 60 * 1000
  return new Date(past)
}


async function main() {
  console.log('🧽 Clearing existing data...')
  // Delete children first to satisfy FKs
  await prisma.moodboardProduct.deleteMany()
  await prisma.moodboardStylingTip.deleteMany()
  await prisma.moodboardTag.deleteMany()
  await prisma.productTag.deleteMany()
  await prisma.moodboard.deleteMany()
  await prisma.product.deleteMany()

  console.log('🌸 Seeding Lookbook sample data...')

  // PRODUCTS
  const products = await prisma.product.createMany({
    data: [
      {
        id: 'prod_001',
        name: 'Classic Trench Coat',
        slug: 'classic-trench-coat',
        price: 450.00,
        imageUrl: 'https://images.unsplash.com/photo-1556906781-9b8de50c1f4b',
        affiliateUrl: 'https://example.com/affiliate/burberry-trench',
        brand: 'Burberry',
        category: 'Outerwear',
        description: 'A timeless trench coat perfect for any season.', blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH', purchaseType: 'affiliate', isFeatured: true
      },
      {
        id: 'prod_002',
        name: 'Silk Midi Dress',
        slug: 'silk-midi-dress',
        price: 320.00,
        imageUrl: 'https://images.unsplash.com/photo-1520975918311-9d06c2a63a0e',
        affiliateUrl: 'https://example.com/affiliate/silk-midi',
        brand: 'Reformation',
        category: 'Dresses',
        description: 'A graceful silk dress for an effortlessly chic look.', blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj', purchaseType: 'affiliate', isFeatured: false
      },
      {
        id: 'prod_003',
        name: 'High Waist Trousers',
        slug: 'high-waist-trousers',
        price: 180.00,
        imageUrl: 'https://images.unsplash.com/photo-1600180758890-6ff53b6aebd7',
        affiliateUrl: 'https://example.com/affiliate/trousers', blurhash: 'L9B4yU8w0K~p0000Rj%M-;00M{Rj', brand: 'Tot�me', category: 'Bottoms', description: 'Elegant trousers that pair perfectly with any top.', purchaseType: 'direct', isFeatured: true
      },
      {
        id: 'prod_004',
        name: 'Cashmere Sweater',
        slug: 'cashmere-sweater',
        price: 290.00,
        imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b62716f',
        affiliateUrl: 'https://example.com/affiliate/cashmere',
        brand: 'The Row',
        category: 'Knitwear',
        description: 'Soft luxury cashmere sweater for minimal comfort.', blurhash: 'L8Ad_400IUof00RjIUj[00xuM{of', purchaseType: 'affiliate', isFeatured: false
      },
      {
        id: 'prod_005',
        name: 'Leather Loafers',
        slug: 'leather-loafers',
        price: 230.00,
        imageUrl: 'https://images.unsplash.com/photo-1600181955023-203cf24b8b03',
        affiliateUrl: 'https://example.com/affiliate/loafers',
        brand: 'Gucci',
        category: 'Shoes',
        description: 'Classic loafers to elevate your day-to-day look.', blurhash: 'L6H2X{of00of~qRjIUj[00M{M{xv', purchaseType: 'affiliate', isFeatured: true
      },
      {
        id: 'prod_006',
        name: 'Structured Handbag',
        slug: 'structured-handbag',
        price: 650.00,
        imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f92',
        affiliateUrl: 'https://example.com/affiliate/handbag',
        brand: 'Celine',
        category: 'Accessories',
        description: 'A polished structured bag for timeless sophistication.', blurhash: 'L5I%8Z%MRjof00RjIUxu00RjM{of', purchaseType: 'direct', isFeatured: false
      }
    ]
  })
  console.log(`👜 Inserted ${products.count} products.`)

  // PRODUCT TAGS (note camelCase productId)
  await prisma.productTag.createMany({
    data: [
      { productId: 'prod_001', tag: 'outerwear' },
      { productId: 'prod_001', tag: 'classic' },
      { productId: 'prod_002', tag: 'dress' },
      { productId: 'prod_002', tag: 'feminine' },
      { productId: 'prod_003', tag: 'tailored' },
      { productId: 'prod_004', tag: 'minimalist' },
      { productId: 'prod_005', tag: 'footwear' },
      { productId: 'prod_005', tag: 'classic' },
      { productId: 'prod_006', tag: 'accessory' }
    ]
  })

  // MOODBOARDS
  await prisma.moodboard.create({
    data: {
      id: 'mood_001',
      title: 'Parisian Chic',
      slug: 'parisian-chic',
      description: 'Effortlessly elegant French-inspired looks.',
      coverImage: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f', coverBlurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj', isFeatured: true,
      howToWear: 'Pair trench with neutrals and minimal accessories.',
      tags: { create: [{ tag: 'french' }, { tag: 'minimalist' }, { tag: 'classic' }] },
      stylingTips: {
        create: [
          { tip: 'Layer with neutral pieces', sortOrder: 1 },
          { tip: 'Keep accessories minimal', sortOrder: 2 }
        ]
      },
      products: {
        create: [
          { productId: 'prod_001', sortOrder: 1 },
          { productId: 'prod_004', sortOrder: 2 },
          { productId: 'prod_005', sortOrder: 3 }
        ]
      }
    }
  })

  await prisma.moodboard.create({
    data: {
      id: 'mood_002',
      title: 'Summer Ease',
      slug: 'summer-ease',
      description: 'Light fabrics and muted tones for easy summer styling.',
      coverImage: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68', coverBlurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH', isFeatured: false,
      howToWear: 'Mix linen and cotton with flat sandals.',
      tags: { create: [{ tag: 'summer' }, { tag: 'casual' }] },
      stylingTips: {
        create: [
          { tip: 'Add a straw hat for texture', sortOrder: 1 },
          { tip: 'Keep fabrics breathable', sortOrder: 2 }
        ]
      },
      products: {
        create: [
          { productId: 'prod_002', sortOrder: 1 },
          { productId: 'prod_003', sortOrder: 2 },
          { productId: 'prod_006', sortOrder: 3 }
        ]
      }
    }
  })

  await prisma.moodboard.create({
    data: {
      id: 'mood_003',
      title: 'Modern Minimal',
      slug: 'modern-minimal',
      description: 'Tonal layers and clean silhouettes.',
      coverImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', coverBlurhash: 'L9B4yU8w0K~p0000Rj%M-;00M{Rj', isFeatured: true,
      howToWear: 'Focus on structure and simplicity.',
      tags: { create: [{ tag: 'minimalist' }, { tag: 'neutral' }] },
      stylingTips: {
        create: [
          { tip: 'Choose structured pieces', sortOrder: 1 },
          { tip: 'Stick to a neutral palette', sortOrder: 2 }
        ]
      },
      products: {
        create: [
          { productId: 'prod_003', sortOrder: 1 },
          { productId: 'prod_004', sortOrder: 2 },
          { productId: 'prod_005', sortOrder: 3 }
        ]
      }
    }
  })

  console.log('🧷 Moodboards inserted.')

  const email = 'admin@example.com';
  const password = 'Admin@123'; // Change this before deploying
  const name = 'Default Admin';

  // Hash the password before storing
  const passwordHash = await bcrypt.hash(password, 10);

  // Upsert ensures idempotent seeding — it won’t duplicate
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      id: randomUUID(),
      email,
      name,
      passwordHash,
      role: 'admin',
    },
  });

  console.log('✅ Default admin user created:', email);

  console.log('🧹 Clearing analytics_events table...')
  await prisma.analyticsEvent.deleteMany()

  console.log('🌱 Seeding new analytics events...')
  const total = 1200
  const batchSize = 200
  for (let i = 0; i < total; i += batchSize) {
    const events = Array.from({ length: batchSize }, randomEvent)
    await prisma.analyticsEvent.createMany({ data: events })
    process.stdout.write(`Inserted ${i + batchSize}/${total}\r`)
  }

  console.log('✅ Seed complete!')

}

function randomEvent() {
  const type = pick(eventTypes)
  const productId = type.includes('product') || type.includes('favorite') ? pick(['prod_001','prod_002','prod_003','prod_004','prod_005','prod_006']) : null
  const moodboardId = type.includes('moodboard') ? pick(['mood_001','mood_002','mood_003']) : null
  const userId = randomUUID()
  const createdAt = recentDateWithinDays(30)

  let metadata = {}
  if (type === 'search') {
    metadata = { term: pick(['coat', 'boots', 'denim', 'handbag', 'dress']) }
  } else if (productId) {
    metadata = { category: pick(categories) }
  }

  return {
    userId,
    eventType: type,
    eventData: metadata,
    productId,
    moodboardId,
    sessionId: randomUUID(),
    ipAddress: randomIp(),
    userAgent: pick(userAgents),
    referrer: pick(referrers),
    resourceType: productId ? 'product' : moodboardId ? 'moodboard' : 'page',
    resourceId: productId || moodboardId,
    resourceName: productId || moodboardId || 'home',
    metadata,
    url: productId ? `/products/${productId}` : moodboardId ? `/moodboards/${moodboardId}` : '/',
    createdAt
  }
}


main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })




