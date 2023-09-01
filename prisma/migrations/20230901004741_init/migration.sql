/*
  Warnings:

  - The `averageRatings` column on the `Recap` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hoursPlayed` column on the `Recap` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `opponents` column on the `Recap` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `openings` column on the `Recap` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Recap" DROP COLUMN "averageRatings",
ADD COLUMN     "averageRatings" JSONB[],
DROP COLUMN "hoursPlayed",
ADD COLUMN     "hoursPlayed" JSONB[],
DROP COLUMN "opponents",
ADD COLUMN     "opponents" JSONB[],
DROP COLUMN "openings",
ADD COLUMN     "openings" JSONB[];
