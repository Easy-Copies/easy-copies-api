/*
  Warnings:

  - Added the required column `statusDescription` to the `store_approval_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "store_approval_users" ADD COLUMN     "statusDescription" TEXT NOT NULL;
