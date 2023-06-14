export enum EAppPermission {
	USER_MANAGEMENT = 'User Management',
	ROLE_MANAGEMENT = 'Role Management',
	STORE_MANAGEMENT = 'Store Management',
	STORE_MANAGEMENT_APPROVAL = 'Store Management Approval',
	STORE_MANAGEMENT_SERVICE = 'Store Management Service',
	TRANSACTION_MANAGEMENT = 'Transaction Management',
	TRANSACTION_MANAGEMENT_APPROVAL = 'Transaction Management Approval'
}

export enum EAppPermissionActions {
	CREATE = 'create',
	READ = 'read',
	UPDATE = 'update',
	DELETE = 'delete'
}

export type TPermissionActions = {
	create: boolean
	read: boolean
	update: boolean
	delete: boolean
}
