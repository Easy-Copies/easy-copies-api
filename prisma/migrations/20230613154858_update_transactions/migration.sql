-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'Canceled';

-- AlterTable
ALTER TABLE "transaction_approval_users" ADD COLUMN     "cancelReason" TEXT;
