export enum SupportStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum SupportSubject {
  PRODUCT_INQUIRY = "PRODUCT_INQUIRY",
  ORDER_ISSUE = "ORDER_ISSUE",
  PAYMENT_ISSUE = "PAYMENT_ISSUE",
  TECHNICAL_SUPPORT = "TECHNICAL_SUPPORT",
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
