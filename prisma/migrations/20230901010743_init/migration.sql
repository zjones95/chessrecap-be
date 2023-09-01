/*
  Warnings:

  - The primary key for the `Recap` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Recap` table. All the data in the column will be lost.
  - Made the column `recapId` on table `AverageRating` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recapId` on table `HoursPlayed` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recapId` on table `Opening` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recapId` on table `Opponent` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AverageRating" DROP CONSTRAINT "AverageRating_recapId_fkey";

-- DropForeignKey
ALTER TABLE "HoursPlayed" DROP CONSTRAINT "HoursPlayed_recapId_fkey";

-- DropForeignKey
ALTER TABLE "Opening" DROP CONSTRAINT "Opening_recapId_fkey";

-- DropForeignKey
ALTER TABLE "Opponent" DROP CONSTRAINT "Opponent_recapId_fkey";

-- AlterTable
ALTER TABLE "AverageRating" ALTER COLUMN "recapId" SET NOT NULL,
ALTER COLUMN "recapId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "HoursPlayed" ALTER COLUMN "recapId" SET NOT NULL,
ALTER COLUMN "recapId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Opening" ALTER COLUMN "recapId" SET NOT NULL,
ALTER COLUMN "recapId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Opponent" ALTER COLUMN "recapId" SET NOT NULL,
ALTER COLUMN "recapId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Recap" DROP CONSTRAINT "Recap_pkey",
DROP COLUMN "name",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Recap_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Recap_id_seq";

-- AddForeignKey
ALTER TABLE "AverageRating" ADD CONSTRAINT "AverageRating_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "Recap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoursPlayed" ADD CONSTRAINT "HoursPlayed_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "Recap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opponent" ADD CONSTRAINT "Opponent_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "Recap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opening" ADD CONSTRAINT "Opening_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "Recap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
