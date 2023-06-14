/*
  Warnings:

  - You are about to drop the column `price` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerSheet` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `storePrice` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storePricePerSheet` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "price",
DROP COLUMN "pricePerSheet",
ADD COLUMN     "storePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "storePricePerSheet" DOUBLE PRECISION NOT NULL;
