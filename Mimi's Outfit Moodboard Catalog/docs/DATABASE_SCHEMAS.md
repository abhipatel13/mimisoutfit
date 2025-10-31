# Database Schemas

Complete database schemas for implementing The Lookbook by Mimi backend API.

---

## PostgreSQL Schema

### Products Table
```sql
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10, 2),
  image_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  brand VARCHAR(100),
  category VARCHAR(100),
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Tags (many-to-many relationship)
CREATE TABLE product_tags (
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (product_id, tag)
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_created ON products(created_at);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_product_tags_tag ON product_tags(tag);

-- Full-text search index
CREATE INDEX idx_products_search ON products 
USING GIN(to_tsvector('english', name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(description, '')));
```

### Moodboards Table
```sql
CREATE TABLE moodboards (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  how_to_wear TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Moodboard Tags (many-to-many)
CREATE TABLE moodboard_tags (
  moodboard_id VARCHAR(50) REFERENCES moodboards(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (moodboard_id, tag)
);

-- Moodboard Styling Tips (one-to-many)
CREATE TABLE moodboard_styling_tips (
  id SERIAL PRIMARY KEY,
  moodboard_id VARCHAR(50) REFERENCES moodboards(id) ON DELETE CASCADE,
  tip TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Moodboard Products (many-to-many with order)
CREATE TABLE moodboard_products (
  moodboard_id VARCHAR(50) REFERENCES moodboards(id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (moodboard_id, product_id)
);

-- Indexes
CREATE INDEX idx_moodboards_featured ON moodboards(is_featured);
CREATE INDEX idx_moodboards_created ON moodboards(created_at);
CREATE INDEX idx_moodboard_tags_tag ON moodboard_tags(tag);
CREATE INDEX idx_moodboard_products_moodboard ON moodboard_products(moodboard_id);
CREATE INDEX idx_moodboard_products_product ON moodboard_products(product_id);
```

---

## MongoDB Schema

### Products Collection
```javascript
{
  _id: ObjectId("..."),
  id: "prod_001",                    // String ID for API
  name: "Classic Trench Coat",
  slug: "classic-trench-coat",
  price: 450.00,
  imageUrl: "https://...",
  affiliateUrl: "https://...",
  brand: "Burberry",
  tags: ["outerwear", "classic", "timeless"],
  category: "outerwear",
  description: "A timeless trench coat...",
  isFeatured: true,
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}

// Indexes
db.products.createIndex({ id: 1 }, { unique: true })
db.products.createIndex({ slug: 1 }, { unique: true })
db.products.createIndex({ category: 1 })
db.products.createIndex({ brand: 1 })
db.products.createIndex({ tags: 1 })
db.products.createIndex({ price: 1 })
db.products.createIndex({ isFeatured: 1 })
db.products.createIndex({ createdAt: -1 })

// Text search index
db.products.createIndex({
  name: "text",
  brand: "text",
  description: "text",
  tags: "text",
  category: "text"
})
```

### Moodboards Collection
```javascript
{
  _id: ObjectId("..."),
  id: "mood_001",                    // String ID for API
  title: "Parisian Chic",
  description: "Effortlessly elegant French-inspired looks",
  coverImage: "https://...",
  products: [
    {
      id: "prod_001",
      name: "Classic Trench Coat",
      slug: "classic-trench-coat",
      price: 450.00,
      imageUrl: "https://...",
      affiliateUrl: "https://...",
      brand: "Burberry",
      tags: ["outerwear", "classic"],
      category: "outerwear",
      description: "A timeless trench coat...",
      isFeatured: true,
      createdAt: ISODate("2024-01-15T10:30:00Z")
    }
  ],
  tags: ["minimalist", "french", "classic"],
  isFeatured: true,
  stylingTips: [
    "Layer with neutral pieces",
    "Keep accessories minimal"
  ],
  howToWear: "Perfect for transitional seasons...",
  createdAt: ISODate("2024-01-20T10:30:00Z"),
  updatedAt: ISODate("2024-01-25T14:20:00Z")
}

// Indexes
db.moodboards.createIndex({ id: 1 }, { unique: true })
db.moodboards.createIndex({ tags: 1 })
db.moodboards.createIndex({ isFeatured: 1 })
db.moodboards.createIndex({ createdAt: -1 })

// Text search index
db.moodboards.createIndex({
  title: "text",
  description: "text",
  tags: "text"
})
```

---

## MySQL Schema

### Products Table
```sql
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10, 2),
  image_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  brand VARCHAR(100),
  category VARCHAR(100),
  description TEXT,
  is_featured BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_brand (brand),
  INDEX idx_price (price),
  INDEX idx_featured (is_featured),
  INDEX idx_created (created_at),
  INDEX idx_slug (slug),
  FULLTEXT idx_search (name, brand, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_tags (
  product_id VARCHAR(50),
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (product_id, tag),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Moodboards Table
```sql
CREATE TABLE moodboards (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT 0,
  how_to_wear TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_featured (is_featured),
  INDEX idx_created (created_at),
  FULLTEXT idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE moodboard_tags (
  moodboard_id VARCHAR(50),
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (moodboard_id, tag),
  FOREIGN KEY (moodboard_id) REFERENCES moodboards(id) ON DELETE CASCADE,
  INDEX idx_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE moodboard_styling_tips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  moodboard_id VARCHAR(50),
  tip TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (moodboard_id) REFERENCES moodboards(id) ON DELETE CASCADE,
  INDEX idx_moodboard (moodboard_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE moodboard_products (
  moodboard_id VARCHAR(50),
  product_id VARCHAR(50),
  sort_order INT DEFAULT 0,
  PRIMARY KEY (moodboard_id, product_id),
  FOREIGN KEY (moodboard_id) REFERENCES moodboards(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_moodboard (moodboard_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Prisma Schema (Node.js ORM)

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Product {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  price         Decimal? @db.Decimal(10, 2)
  imageUrl      String   @map("image_url")
  affiliateUrl  String   @map("affiliate_url")
  brand         String?
  category      String?
  description   String?  @db.Text
  isFeatured    Boolean  @default(false) @map("is_featured")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  tags          ProductTag[]
  moodboards    MoodboardProduct[]

  @@index([category])
  @@index([brand])
  @@index([price])
  @@index([isFeatured])
  @@index([createdAt])
  @@map("products")
}

model ProductTag {
  productId String  @map("product_id")
  tag       String
  
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@id([productId, tag])
  @@index([tag])
  @@map("product_tags")
}

model Moodboard {
  id            String   @id @default(cuid())
  title         String
  description   String?  @db.Text
  coverImage    String   @map("cover_image")
  isFeatured    Boolean  @default(false) @map("is_featured")
  howToWear     String?  @db.Text @map("how_to_wear")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  tags          MoodboardTag[]
  stylingTips   MoodboardStylingTip[]
  products      MoodboardProduct[]

  @@index([isFeatured])
  @@index([createdAt])
  @@map("moodboards")
}

model MoodboardTag {
  moodboardId String     @map("moodboard_id")
  tag         String
  
  moodboard   Moodboard @relation(fields: [moodboardId], references: [id], onDelete: Cascade)

  @@id([moodboardId, tag])
  @@index([tag])
  @@map("moodboard_tags")
}

model MoodboardStylingTip {
  id          Int       @id @default(autoincrement())
  moodboardId String    @map("moodboard_id")
  tip         String    @db.Text
  sortOrder   Int       @default(0) @map("sort_order")
  
  moodboard   Moodboard @relation(fields: [moodboardId], references: [id], onDelete: Cascade)

  @@index([moodboardId])
  @@map("moodboard_styling_tips")
}

model MoodboardProduct {
  moodboardId String    @map("moodboard_id")
  productId   String    @map("product_id")
  sortOrder   Int       @default(0) @map("sort_order")
  
  moodboard   Moodboard @relation(fields: [moodboardId], references: [id], onDelete: Cascade)
  product     Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@id([moodboardId, productId])
  @@index([moodboardId])
  @@index([productId])
  @@map("moodboard_products")
}
```

---

## Sample Data Insert Scripts

### PostgreSQL
```sql
-- Insert sample product
INSERT INTO products (id, name, slug, price, image_url, affiliate_url, brand, category, description, is_featured)
VALUES (
  'prod_001',
  'Classic Trench Coat',
  'classic-trench-coat',
  450.00,
  'https://images.unsplash.com/photo-1...',
  'https://example.com/affiliate/...',
  'Burberry',
  'outerwear',
  'A timeless trench coat perfect for any season',
  true
);

-- Insert product tags
INSERT INTO product_tags (product_id, tag) VALUES
  ('prod_001', 'outerwear'),
  ('prod_001', 'classic'),
  ('prod_001', 'timeless');

-- Insert sample moodboard
INSERT INTO moodboards (id, title, description, cover_image, is_featured, how_to_wear)
VALUES (
  'mood_001',
  'Parisian Chic',
  'Effortlessly elegant French-inspired looks',
  'https://images.unsplash.com/photo-2...',
  true,
  'Perfect for transitional seasons...'
);

-- Insert moodboard tags
INSERT INTO moodboard_tags (moodboard_id, tag) VALUES
  ('mood_001', 'minimalist'),
  ('mood_001', 'french'),
  ('mood_001', 'classic');

-- Insert styling tips
INSERT INTO moodboard_styling_tips (moodboard_id, tip, sort_order) VALUES
  ('mood_001', 'Layer with neutral pieces', 1),
  ('mood_001', 'Keep accessories minimal', 2);

-- Link products to moodboard
INSERT INTO moodboard_products (moodboard_id, product_id, sort_order)
VALUES ('mood_001', 'prod_001', 1);
```

### MongoDB
```javascript
// Insert sample product
db.products.insertOne({
  id: "prod_001",
  name: "Classic Trench Coat",
  slug: "classic-trench-coat",
  price: 450.00,
  imageUrl: "https://images.unsplash.com/photo-1...",
  affiliateUrl: "https://example.com/affiliate/...",
  brand: "Burberry",
  tags: ["outerwear", "classic", "timeless"],
  category: "outerwear",
  description: "A timeless trench coat perfect for any season",
  isFeatured: true,
  createdAt: new Date("2024-01-15T10:30:00Z"),
  updatedAt: new Date("2024-01-15T10:30:00Z")
});

// Insert sample moodboard
db.moodboards.insertOne({
  id: "mood_001",
  title: "Parisian Chic",
  description: "Effortlessly elegant French-inspired looks",
  coverImage: "https://images.unsplash.com/photo-2...",
  products: [
    {
      id: "prod_001",
      name: "Classic Trench Coat",
      slug: "classic-trench-coat",
      price: 450.00,
      imageUrl: "https://images.unsplash.com/photo-1...",
      affiliateUrl: "https://example.com/affiliate/...",
      brand: "Burberry",
      tags: ["outerwear", "classic"],
      category: "outerwear",
      description: "A timeless trench coat...",
      isFeatured: true,
      createdAt: new Date("2024-01-15T10:30:00Z")
    }
  ],
  tags: ["minimalist", "french", "classic"],
  isFeatured: true,
  stylingTips: [
    "Layer with neutral pieces",
    "Keep accessories minimal"
  ],
  howToWear: "Perfect for transitional seasons...",
  createdAt: new Date("2024-01-20T10:30:00Z"),
  updatedAt: new Date("2024-01-25T14:20:00Z")
});
```

---

## Query Examples

### PostgreSQL - Get Products with Pagination
```sql
SELECT p.*, array_agg(pt.tag) as tags
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
WHERE p.category = 'outerwear'
  AND p.price BETWEEN 100 AND 500
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 12 OFFSET 0;
```

### MongoDB - Get Products with Pagination
```javascript
db.products.find({
  category: "outerwear",
  price: { $gte: 100, $lte: 500 }
})
.sort({ createdAt: -1 })
.skip(0)
.limit(12)
.toArray();
```

### PostgreSQL - Search Products (Full-Text)
```sql
SELECT p.*, array_agg(pt.tag) as tags
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
WHERE to_tsvector('english', p.name || ' ' || COALESCE(p.brand, '') || ' ' || COALESCE(p.description, ''))
  @@ plainto_tsquery('english', 'trench coat')
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### MongoDB - Search Products (Text Search)
```javascript
db.products.find({
  $text: { $search: "trench coat" }
})
.sort({ createdAt: -1 })
.toArray();
```

---

## Migration Scripts

### PostgreSQL Migration
```sql
-- Run this to create all tables and indexes
\i create_tables.sql
\i create_indexes.sql
\i insert_sample_data.sql
```

### Prisma Migration
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply migration to production
npx prisma migrate deploy
```

---

For API implementation details, see: `/docs/BACKEND_API_SPEC.md`
