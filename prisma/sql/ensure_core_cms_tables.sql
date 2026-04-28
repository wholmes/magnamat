-- Idempotent bootstrap for Neon / partial DBs (no Prisma migration history).
-- Creates any missing core tables to match prisma/schema.prisma.

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "SiteChrome" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "configJson" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteChrome_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "availabilityStatus" TEXT NOT NULL DEFAULT '',
    "navHideOnScroll" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SeoSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MarketingPage" (
    "id" TEXT NOT NULL DEFAULT 'home',
    "contentJson" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HeroSceneCamera" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "configJson" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSceneCamera_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FeaturesSceneCamera" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "configJson" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturesSceneCamera_pkey" PRIMARY KEY ("id")
);

-- Older SeoSettings rows created before noIndex existed
ALTER TABLE "SeoSettings" ADD COLUMN IF NOT EXISTS "noIndex" BOOLEAN NOT NULL DEFAULT false;
