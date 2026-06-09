package org.web.inventory.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAuditResponse {
    private Long id;
    private Long productId;
    private String productName;
    private int oldStock;
    private int newStock;
    private String stockType;
    private String reason;
    private String changedByEmail;
    private LocalDateTime changedAt;
}
