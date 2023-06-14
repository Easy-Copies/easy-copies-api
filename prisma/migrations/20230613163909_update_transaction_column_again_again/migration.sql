/*
  Warnings:

  - Made the column `storeMapCoordinate` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "storeMapCoordinate" SET NOT NULL,
ALTER COLUMN "storePricePerSheet" DROP NOT NULL;
