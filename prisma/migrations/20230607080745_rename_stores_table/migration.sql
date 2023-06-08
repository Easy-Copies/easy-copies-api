/*
  Warnings:

  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_approverId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_districtCode_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_provinceCode_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_regencyCode_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_userId_fkey";

-- DropTable
DROP TABLE "Store";

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "provinceCode" TEXT NOT NULL,
    "regencyCode" TEXT NOT NULL,
    "districtCode" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "mapCoordinate" JSONB NOT NULL,
    "storeLogo" TEXT,
    "storePhoto" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "ktpPhoto" TEXT NOT NULL,
    "npwp" TEXT,
    "npwpPhoto" TEXT,
    "userId" TEXT NOT NULL,
    "approverId" TEXT,
    "approvalStatus" "StoreApprovalStatus" NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_provinceCode_fkey" FOREIGN KEY ("provinceCode") REFERENCES "provinces"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_regencyCode_fkey" FOREIGN KEY ("regencyCode") REFERENCES "regencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_districtCode_fkey" FOREIGN KEY ("districtCode") REFERENCES "districts"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
