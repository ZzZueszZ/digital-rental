import { PermissionResponse } from "./permission";

export interface RoleResponse {
  id: number;
  code: string;
  description: string;
  permissions: PermissionResponse[];
}

export interface RoleRequest {
  code: string;
  description?: string;
}

export interface RoleAssignPermissionRequest {
  permissionIds: number[];
}
