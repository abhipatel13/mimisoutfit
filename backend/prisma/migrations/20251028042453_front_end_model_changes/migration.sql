-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('affiliate', 'direct');

-- AlterTable
ALTER TABLE "moodboards" ADD COLUMN     "cover_blurhash" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "blurhash" TEXT,
ADD COLUMN     "purchase_type" "PurchaseType" NOT NULL DEFAULT 'affiliate';
