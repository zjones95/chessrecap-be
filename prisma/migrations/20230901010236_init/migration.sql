/*
  Warnings:

  - Added the required column `name` to the `Recap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recap" ADD COLUMN     "name" TEXT NOT NULL;
