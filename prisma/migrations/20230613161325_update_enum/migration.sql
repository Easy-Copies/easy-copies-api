/*
  Warnings:

  - Changed the type of `status` on the `transaction_approval_users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionApprovalStatus" AS ENUM ('WaitingBeProcess', 'OnProcess', 'Rejected', 'Canceled', 'Done');

-- AlterTable
ALTER TABLE "transaction_approval_users" DROP COLUMN "status",
ADD COLUMN     "status" "TransactionApprovalStatus" NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "status",
ADD COLUMN     "status" "TransactionApprovalStatus" NOT NULL;

-- DropEnum
DROP TYPE "TransactionStatus";
