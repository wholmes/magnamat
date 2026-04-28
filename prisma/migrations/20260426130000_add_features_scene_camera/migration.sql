-- Features column WebGL camera (same JSON schema as HeroSceneCamera).
CREATE TABLE IF NOT EXISTS "FeaturesSceneCamera" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "configJson" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturesSceneCamera_pkey" PRIMARY KEY ("id")
);
