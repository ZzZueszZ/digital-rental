package org.web.inventory.service;

import org.springframework.data.domain.Page;
import org.web.inventory.dto.request.AdjustStockRequest;
import org.web.inventory.dto.response.InventoryAuditResponse;

import java.time.LocalDate;

public interface InventoryService {

    InventoryAuditResponse adjustStock(Long productId, AdjustStockRequest request);

    Page<InventoryAuditResponse> getInventoryLogs(Long productId, LocalDate fromDate, LocalDate toDate, int page, int size);
}
