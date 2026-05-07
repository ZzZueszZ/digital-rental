export enum SupportStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum SupportSubject {
  TECHNICAL = "TECHNICAL",
  RENTAL_PROCESS = "RENTAL_PROCESS",
  PAYMENT = "PAYMENT",
  EQUIPMENT_ISSUE = "EQUIPMENT_ISSUE",
  OTHER = "OTHER",
}

export interface SupportTicketRequest {
  name: string;
  phone: string;
  email: string;
  subject: SupportSubject;
  message: string;
}

export interface SupportTicketReplyRequest {
  replyMessage: string;
  internalNote?: string;
  markAsResolved?: boolean;
}

export interface SupportTicketResponse {
  id: number;
  name: string;
  phone: string;
  email: string;
  subject: SupportSubject;
  message: string;
  status: SupportStatus;
  internalNote?: string;
  replyMessage?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  processedById?: number;
  processedByName?: string;
}
