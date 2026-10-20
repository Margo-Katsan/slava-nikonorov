-- CreateTable
CREATE TABLE "SiteContact" (
    "id" VARCHAR(24) NOT NULL,
    "url" VARCHAR(700) NOT NULL,
    "description" VARCHAR(140) NOT NULL DEFAULT '',
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContact_pkey" PRIMARY KEY ("id")
);
