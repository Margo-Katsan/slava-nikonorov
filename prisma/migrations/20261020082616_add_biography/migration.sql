-- CreateTable
CREATE TABLE "BioProfile" (
    "id" TEXT NOT NULL,
    "heading" VARCHAR(80) NOT NULL DEFAULT 'Трохи про',
    "accent" VARCHAR(80) NOT NULL DEFAULT 'мене',
    "lead" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "fullBio" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BioProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BioFilmFrame" (
    "id" TEXT NOT NULL,
    "bioId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "title" VARCHAR(40) NOT NULL,
    "subtitle" VARCHAR(100) NOT NULL DEFAULT '',
    "position" VARCHAR(32) NOT NULL DEFAULT 'center',
    "mediaAssetId" TEXT,

    CONSTRAINT "BioFilmFrame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BioFilmFrame_mediaAssetId_idx" ON "BioFilmFrame"("mediaAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "BioFilmFrame_bioId_slot_key" ON "BioFilmFrame"("bioId", "slot");

-- AddForeignKey
ALTER TABLE "BioFilmFrame" ADD CONSTRAINT "BioFilmFrame_bioId_fkey" FOREIGN KEY ("bioId") REFERENCES "BioProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BioFilmFrame" ADD CONSTRAINT "BioFilmFrame_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
