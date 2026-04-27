-- CreateTable
CREATE TABLE "HeroSceneCamera" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "configJson" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSceneCamera_pkey" PRIMARY KEY ("id")
);
