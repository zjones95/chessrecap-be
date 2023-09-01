-- CreateTable
CREATE TABLE "Recap" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "averageRatings" JSONB NOT NULL,
    "highestRatings" JSONB NOT NULL,
    "hoursPlayed" JSONB NOT NULL,
    "totalGames" JSONB NOT NULL,
    "streaks" JSONB NOT NULL,
    "opponents" JSONB NOT NULL,
    "openings" JSONB NOT NULL,

    CONSTRAINT "Recap_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recap_name_key" ON "Recap"("name");
