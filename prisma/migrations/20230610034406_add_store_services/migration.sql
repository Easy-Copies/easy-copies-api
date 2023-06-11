-- CreateEnum
CREATE TYPE "StoreServiceName" AS ENUM ('Laminating', 'Priting', 'Jilid', 'Fotocopy');

-- CreateTable
CREATE TABLE "store_services" (
    "id" TEXT NOT NULL,
    "name" "StoreServiceName" NOT NULL,
    "storeId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "pricePerSheet" DOUBLE PRECISION,
    "bindingType" TEXT,
    "fotocopyType" TEXT,

    CONSTRAINT "store_services_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "store_services" ADD CONSTRAINT "store_services_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
