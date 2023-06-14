/*
  Warnings:

  - The values [WaitingBeProcess,Rejected,Canceled] on the enum `TransactionApprovalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionApprovalStatus_new" AS ENUM ('WaitingConfirmation', 'WaitingPayment', 'OnProcess', 'ReadyToPickup', 'Done');
ALTER TABLE "transactions" ALTER COLUMN "status" TYPE "TransactionApprovalStatus_new" USING ("status"::text::"TransactionApprovalStatus_new");
ALTER TABLE "transaction_approval_users" ALTER COLUMN "status" TYPE "TransactionApprovalStatus_new" USING ("status"::text::"TransactionApprovalStatus_new");
ALTER TYPE "TransactionApprovalStatus" RENAME TO "TransactionApprovalStatus_old";
ALTER TYPE "TransactionApprovalStatus_new" RENAME TO "TransactionApprovalStatus";
DROP TYPE "TransactionApprovalStatus_old";
COMMIT;
