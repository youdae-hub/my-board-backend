-- AlterTable
ALTER TABLE "users" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN "google_id" TEXT;

-- AlterTable (make password nullable)
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
