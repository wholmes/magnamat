-- Idempotent: add Features 3D camera CMS table if missing (same as ensure_core_cms_tables fragment).
CREATE TABLE IF NOT EXISTS "FeaturesSceneCamera" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "configJson" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturesSceneCamera_pkey" PRIMARY KEY ("id")
);
