/*
  Warnings:

  - You are about to drop the column `price` on the `store_services` table. All the data in the column will be lost.
  - Added the required column `totalPrice` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "store_services" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL;
