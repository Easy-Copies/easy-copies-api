/*
  Warnings:

  - You are about to drop the column `approvalStatus` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `approverId` on the `stores` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StoreApprovalStatus" ADD VALUE 'Rejected';
ALTER TYPE "StoreApprovalStatus" ADD VALUE 'Revise';
ALTER TYPE "StoreApprovalStatus" ADD VALUE 'Revised';

-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_approverId_fkey";

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "approvalStatus",
DROP COLUMN "approverId",
ADD COLUMN     "addressNote" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "mapCoordinate" DROP NOT NULL;

-- CreateTable
CREATE TABLE "store_approval_users" (
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" "StoreApprovalStatus" NOT NULL,
    "reviseComment" TEXT,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_approval_users_pkey" PRIMARY KEY ("userId","storeId")
);

-- AddForeignKey
ALTER TABLE "store_approval_users" ADD CONSTRAINT "store_approval_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_approval_users" ADD CONSTRAINT "store_approval_users_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
