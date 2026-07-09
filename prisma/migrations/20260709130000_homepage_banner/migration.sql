-- CreateTable
CREATE TABLE "homepage_banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "ctaLabel" TEXT,
    "ctaLink" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deleteReason" TEXT,

    CONSTRAINT "homepage_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "homepage_banners_isActive_displayOrder_idx" ON "homepage_banners"("isActive", "displayOrder");
