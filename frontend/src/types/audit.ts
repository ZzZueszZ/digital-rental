export interface AuditLog {
  id: number;
  actorUserId: number;
  actorEmail: string;
  targetType: string;
  targetId: number;
  action: string;
  description: string;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface AuditLogResponse {
  data: AuditLog[];
  message: string;
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
  statusCode: number;
  success: boolean;
}
