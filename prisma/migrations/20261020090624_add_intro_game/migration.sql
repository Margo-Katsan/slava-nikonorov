-- CreateTable
CREATE TABLE "IntroGameSettings" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "eyebrow" VARCHAR(120) NOT NULL DEFAULT 'Обережно! Далі — сайт Ніконорова',
    "heading" VARCHAR(65) NOT NULL DEFAULT 'Гра в',
    "accent" VARCHAR(65) NOT NULL DEFAULT 'голови',
    "description" VARCHAR(700) NOT NULL DEFAULT 'Кидай мої голови в контейнер. Дві однакові зливаються в одну більшу!',
    "tagline" VARCHAR(200) NOT NULL DEFAULT 'Я покажу, наскільки глибока ротова нора…',
    "skipLabel" VARCHAR(60) NOT NULL DEFAULT 'Пропустити вступ',
    "siteHref" VARCHAR(100) NOT NULL DEFAULT '/home',
    "autoModeDefault" BOOLEAN NOT NULL DEFAULT false,
    "autoIntervalMs" INTEGER NOT NULL DEFAULT 1250,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntroGameSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntroGameHead" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "mediaAssetId" TEXT,

    CONSTRAINT "IntroGameHead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntroGameHead_mediaAssetId_idx" ON "IntroGameHead"("mediaAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "IntroGameHead_settingsId_level_key" ON "IntroGameHead"("settingsId", "level");

-- AddForeignKey
ALTER TABLE "IntroGameHead" ADD CONSTRAINT "IntroGameHead_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "IntroGameSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntroGameHead" ADD CONSTRAINT "IntroGameHead_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
