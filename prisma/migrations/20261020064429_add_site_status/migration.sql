-- CreateTable
CREATE TABLE "SiteStatus" (
    "id" TEXT NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteStatus_pkey" PRIMARY KEY ("id")
);
