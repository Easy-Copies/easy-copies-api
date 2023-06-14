/*
  Warnings:

  - Added the required column `paperType` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupDate` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsiblePerson` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaperType" AS ENUM ('A4');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "description" TEXT,
ADD COLUMN     "paperType" "PaperType" NOT NULL,
ADD COLUMN     "pickupDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "responsiblePerson" TEXT NOT NULL;
