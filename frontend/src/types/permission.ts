export interface PermissionResponse {
  id: number;
  name: string;
  description: string;
}

export interface PermissionRequest {
  name: string;
  description?: string;
}
