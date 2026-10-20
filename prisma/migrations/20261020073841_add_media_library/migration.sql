-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "url" TEXT NOT NULL,
    "resourceType" VARCHAR(12) NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "format" VARCHAR(20),
    "bytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaUploadTicket" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "resourceType" VARCHAR(12) NOT NULL,
    "issuedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaUploadTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_assetId_key" ON "MediaAsset"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_publicId_key" ON "MediaAsset"("publicId");

-- CreateIndex
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

-- CreateIndex
CREATE INDEX "MediaAsset_category_createdAt_idx" ON "MediaAsset"("category", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaUploadTicket_publicId_key" ON "MediaUploadTicket"("publicId");

-- CreateIndex
CREATE INDEX "MediaUploadTicket_issuedById_createdAt_idx" ON "MediaUploadTicket"("issuedById", "createdAt");
