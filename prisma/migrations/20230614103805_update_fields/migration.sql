/*
  Warnings:

  - You are about to drop the column `storePrice` on the `transactions` table. All the data in the column will be lost.
  - Made the column `pricePerSheet` on table `store_services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `files` on table `transactions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `storePricePerSheet` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "store_services" ALTER COLUMN "pricePerSheet" SET NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "storePrice",
ALTER COLUMN "files" SET NOT NULL,
ALTER COLUMN "files" SET DEFAULT '[]',
ALTER COLUMN "storePricePerSheet" SET NOT NULL;
