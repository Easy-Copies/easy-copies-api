/*
  Warnings:

  - The values [Priting] on the enum `StoreServiceName` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StoreServiceName_new" AS ENUM ('Laminating', 'Printing', 'Jilid', 'Fotocopy');
ALTER TABLE "store_services" ALTER COLUMN "name" TYPE "StoreServiceName_new" USING ("name"::text::"StoreServiceName_new");
ALTER TABLE "transactions" ALTER COLUMN "storeServiceType" TYPE "StoreServiceName_new" USING ("storeServiceType"::text::"StoreServiceName_new");
ALTER TYPE "StoreServiceName" RENAME TO "StoreServiceName_old";
ALTER TYPE "StoreServiceName_new" RENAME TO "StoreServiceName";
DROP TYPE "StoreServiceName_old";
COMMIT;
