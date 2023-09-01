/*
  Warnings:

  - You are about to drop the `Recap` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Recap";

-- CreateTable
CREATE TABLE "AverageRating" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL,
    "statisticsId" INTEGER,

    CONSTRAINT "AverageRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoursPlayed" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "hoursPlayed" DOUBLE PRECISION NOT NULL,
    "statisticsId" INTEGER,

    CONSTRAINT "HoursPlayed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opponent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "wins" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "statisticsId" INTEGER,

    CONSTRAINT "Opponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opening" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "wins" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "statisticsId" INTEGER,

    CONSTRAINT "Opening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistics" (
    "id" SERIAL NOT NULL,
    "highestRatings" JSONB NOT NULL,
    "totalGames" JSONB NOT NULL,
    "streaks" JSONB NOT NULL,

    CONSTRAINT "Statistics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AverageRating" ADD CONSTRAINT "AverageRating_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "Statistics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoursPlayed" ADD CONSTRAINT "HoursPlayed_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "Statistics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opponent" ADD CONSTRAINT "Opponent_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "Statistics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opening" ADD CONSTRAINT "Opening_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "Statistics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
