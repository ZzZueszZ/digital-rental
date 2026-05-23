export interface InventoryAuditResponse {
  id: number;
  productId: number;
  productName: string;
  oldStock: number;
  newStock: number;
  stockType: "SALE" | "RENTAL";
  reason: string;
  changedByEmail: string;
  changedAt: string;
}

export interface AdjustStockRequest {
  quantityChange: number; // > 0 for importing, < 0 for exporting / removing stock
  type?: "SALE" | "RENTAL";
  reason?: string;
}
