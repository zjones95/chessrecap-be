/*
  Warnings:

  - You are about to drop the column `statisticsId` on the `AverageRating` table. All the data in the column will be lost.
  - You are about to drop the column `statisticsId` on the `HoursPlayed` table. All the data in the column will be lost.
  - You are about to drop the column `statisticsId` on the `Opening` table. All the data in the column will be lost.
  - You are about to drop the column `statisticsId` on the `Opponent` table. All the data in the column will be lost.
  - You are about to drop the `Statistics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AverageRating" DROP CONSTRAINT "AverageRating_statisticsId_fkey";

-- DropForeignKey
ALTER TABLE "HoursPlayed" DROP CONSTRAINT "HoursPlayed_statisticsId_fkey";

-- DropForeignKey
ALTER TABLE "Opening" DROP CONSTRAINT "Opening_statisticsId_fkey";

-- DropForeignKey
ALTER TABLE "Opponent" DROP CONSTRAINT "Opponent_statisticsId_fkey";

-- AlterTable
ALTER TABLE "AverageRating" DROP COLUMN "statisticsId",
ADD COLUMN     "recapId" INTEGER;

-- AlterTable
ALTER TABLE "HoursPlayed" DROP COLUMN "statisticsId",
ADD COLUMN     "recapId" INTEGER;

-- AlterTable
ALTER TABLE "Opening" DROP COLUMN "statisticsId",
ADD COLUMN     "recapId" INTEGER;

-- AlterTable
ALTER TABLE "Opponent" DROP COLUMN "statisticsId",
ADD COLUMN     "recapId" INTEGER;

-- DropTable
DROP TABLE "Statistics";

-- CreateTable
CREATE TABLE "Recap" (
    "id" SERIAL NOT NULL,
    "highestRatings" JSONB NOT NULL,
    "totalGames" JSONB NOT NULL,
    "streaks" JSONB NOT NULL,

    CONSTRAINT "Recap_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AverageRating" ADD CONSTRAINT "AverageRating_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "Recap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoursPlayed" ADD CONSTRAINT "HoursPlayed_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "Recap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opponent" ADD CONSTRAINT "Opponent_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "Recap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opening" ADD CONSTRAINT "Opening_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "Recap"("id") ON DELETE SET NULL ON UPDATE CASCADE;
