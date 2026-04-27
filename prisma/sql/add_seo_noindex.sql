-- Run once if Prisma reports `SeoSettings.noIndex` missing (e.g. DB from `db push` before this column).
ALTER TABLE "SeoSettings" ADD COLUMN IF NOT EXISTS "noIndex" BOOLEAN NOT NULL DEFAULT false;
