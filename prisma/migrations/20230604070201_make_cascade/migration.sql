-- DropForeignKey
ALTER TABLE "permission_roles" DROP CONSTRAINT "permission_roles_permissionCode_fkey";

-- DropForeignKey
ALTER TABLE "permission_roles" DROP CONSTRAINT "permission_roles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "role_users" DROP CONSTRAINT "role_users_roleId_fkey";

-- DropForeignKey
ALTER TABLE "role_users" DROP CONSTRAINT "role_users_userId_fkey";

-- AddForeignKey
ALTER TABLE "role_users" ADD CONSTRAINT "role_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_users" ADD CONSTRAINT "role_users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_roles" ADD CONSTRAINT "permission_roles_permissionCode_fkey" FOREIGN KEY ("permissionCode") REFERENCES "permissions"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_roles" ADD CONSTRAINT "permission_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
