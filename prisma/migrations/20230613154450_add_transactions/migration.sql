-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('WaitingBeProcess', 'OnProcess', 'Rejected', 'Done');

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storePhoneNumber" TEXT NOT NULL,
    "storeEmail" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "pricePerSheet" DOUBLE PRECISION,
    "storeAddress" TEXT NOT NULL,
    "storeAddressNote" TEXT NOT NULL,
    "storeProvince" JSONB,
    "storeRegency" JSONB,
    "storeDistrict" JSONB,
    "storePostalCode" TEXT NOT NULL,
    "storeMapCoordinate" JSONB,
    "storeLogo" TEXT,
    "storePhoto" TEXT NOT NULL,
    "files" JSONB,
    "status" "TransactionStatus" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_approval_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "statusDescription" TEXT NOT NULL,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_approval_users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_approval_users" ADD CONSTRAINT "transaction_approval_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_approval_users" ADD CONSTRAINT "transaction_approval_users_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
