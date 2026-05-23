package org.web.inventory.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.inventory.dto.request.AdjustStockRequest;
import org.web.inventory.dto.request.UpdateStockQuantityRequest;
import org.web.inventory.dto.response.InventoryAuditResponse;
import org.web.inventory.service.InventoryService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PutMapping("/products/{productId}/stock")
    @PreAuthorize("hasAuthority('INVENTORY_WRITE')")
    public ResponseEntity<ApiResponse<InventoryAuditResponse>> adjustStock(
            @PathVariable Long productId,
            @Valid @RequestBody AdjustStockRequest request
    ) {
        InventoryAuditResponse result = inventoryService.adjustStock(productId, request);
        return ResponseEntity.ok(
                ApiResponse.successfulResponse(HttpStatus.OK.value(), "Thao tác kho thành công", result)
        );
    }

    @PutMapping("/products/{productId}/stock/sale")
    @PreAuthorize("hasAuthority('INVENTORY_WRITE')")
    public ResponseEntity<ApiResponse<InventoryAuditResponse>> updateSaleStock(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateStockQuantityRequest request
    ) {
        InventoryAuditResponse result = inventoryService.updateSaleStock(productId, request);
        return ResponseEntity.ok(
                ApiResponse.successfulResponse(HttpStatus.OK.value(), "Cập nhật tồn kho bán thành công", result)
        );
    }

    @PutMapping("/products/{productId}/stock/rental")
    @PreAuthorize("hasAuthority('INVENTORY_WRITE')")
    public ResponseEntity<ApiResponse<InventoryAuditResponse>> updateRentalStock(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateStockQuantityRequest request
    ) {
        InventoryAuditResponse result = inventoryService.updateRentalStock(productId, request);
        return ResponseEntity.ok(
                ApiResponse.successfulResponse(HttpStatus.OK.value(), "Cập nhật tồn kho thuê thành công", result)
        );
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    public ResponseEntity<ApiResponse<List<InventoryAuditResponse>>> getInventoryLogs(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<InventoryAuditResponse> result = inventoryService.getInventoryLogs(productId, fromDate, toDate, page, size);
        return ResponseEntity.ok(
                ApiResponse.successfulPageResponse(HttpStatus.OK.value(), "Lấy lịch sử kho thành công", result)
        );
    }
}
