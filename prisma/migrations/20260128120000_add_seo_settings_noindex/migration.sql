-- Existing databases created before `noIndex` was added (e.g. `db push` only) need this column.
ALTER TABLE "SeoSettings" ADD COLUMN IF NOT EXISTS "noIndex" BOOLEAN NOT NULL DEFAULT false;
