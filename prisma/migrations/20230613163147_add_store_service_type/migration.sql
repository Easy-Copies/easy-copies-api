/*
  Warnings:

  - Added the required column `storeServiceType` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "storeServiceType" "StoreServiceName" NOT NULL;
