-- CreateTable
CREATE TABLE "CreativeItem" (
    "id" TEXT NOT NULL,
    "section" VARCHAR(24) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "subtitle" VARCHAR(220),
    "description" TEXT,
    "body" TEXT,
    "year" INTEGER,
    "categoryTag" VARCHAR(80),
    "linkUrl" VARCHAR(800),
    "mediaAssetId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreativeItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreativeItem_section_sortOrder_idx" ON "CreativeItem"("section", "sortOrder");

-- CreateIndex
CREATE INDEX "CreativeItem_published_section_sortOrder_idx" ON "CreativeItem"("published", "section", "sortOrder");

-- CreateIndex
CREATE INDEX "CreativeItem_mediaAssetId_idx" ON "CreativeItem"("mediaAssetId");

-- AddForeignKey
ALTER TABLE "CreativeItem" ADD CONSTRAINT "CreativeItem_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
