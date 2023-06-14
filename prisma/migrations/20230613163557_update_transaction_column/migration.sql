/*
  Warnings:

  - Added the required column `inkType` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InkType" AS ENUM ('BlackWhite', 'Color');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "inkType" "InkType" NOT NULL;
