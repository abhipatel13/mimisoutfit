-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(10,2),
    "image_url" TEXT NOT NULL,
    "affiliate_url" TEXT NOT NULL,
    "brand" TEXT,
    "category" TEXT,
    "description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "product_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("product_id","tag")
);

-- CreateTable
CREATE TABLE "moodboards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "cover_image" TEXT NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "how_to_wear" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moodboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moodboard_tags" (
    "moodboard_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "moodboard_tags_pkey" PRIMARY KEY ("moodboard_id","tag")
);

-- CreateTable
CREATE TABLE "moodboard_styling_tips" (
    "id" SERIAL NOT NULL,
    "moodboard_id" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "moodboard_styling_tips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moodboard_products" (
    "moodboard_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "moodboard_products_pkey" PRIMARY KEY ("moodboard_id","product_id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE INDEX "products_is_published_idx" ON "products"("is_published");

-- CreateIndex
CREATE INDEX "products_is_featured_idx" ON "products"("is_featured");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products"("created_at");

-- CreateIndex
CREATE INDEX "product_tags_tag_idx" ON "product_tags"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "moodboards_slug_key" ON "moodboards"("slug");

-- CreateIndex
CREATE INDEX "moodboards_is_published_idx" ON "moodboards"("is_published");

-- CreateIndex
CREATE INDEX "moodboards_is_featured_idx" ON "moodboards"("is_featured");

-- CreateIndex
CREATE INDEX "moodboards_created_at_idx" ON "moodboards"("created_at");

-- CreateIndex
CREATE INDEX "moodboard_tags_tag_idx" ON "moodboard_tags"("tag");

-- CreateIndex
CREATE INDEX "moodboard_styling_tips_moodboard_id_idx" ON "moodboard_styling_tips"("moodboard_id");

-- CreateIndex
CREATE INDEX "moodboard_products_moodboard_id_idx" ON "moodboard_products"("moodboard_id");

-- CreateIndex
CREATE INDEX "moodboard_products_product_id_idx" ON "moodboard_products"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moodboard_tags" ADD CONSTRAINT "moodboard_tags_moodboard_id_fkey" FOREIGN KEY ("moodboard_id") REFERENCES "moodboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moodboard_styling_tips" ADD CONSTRAINT "moodboard_styling_tips_moodboard_id_fkey" FOREIGN KEY ("moodboard_id") REFERENCES "moodboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moodboard_products" ADD CONSTRAINT "moodboard_products_moodboard_id_fkey" FOREIGN KEY ("moodboard_id") REFERENCES "moodboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moodboard_products" ADD CONSTRAINT "moodboard_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
