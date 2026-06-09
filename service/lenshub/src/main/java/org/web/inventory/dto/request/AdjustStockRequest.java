package org.web.inventory.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdjustStockRequest {

    // > 0 for importing, < 0 for exporting / removing stock
    @NotNull(message = "Quantity change cannot be null")
    private Integer quantityChange;

    private String type; // "SALE" or "RENTAL"

    private String reason;
}
