-- CreateTable
CREATE TABLE "AppReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "headline" TEXT,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppReview_userId_key" ON "AppReview"("userId");

-- CreateIndex
CREATE INDEX "AppReview_rating_idx" ON "AppReview"("rating");

-- CreateIndex
CREATE INDEX "AppReview_createdAt_idx" ON "AppReview"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "AppReview" ADD CONSTRAINT "AppReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
