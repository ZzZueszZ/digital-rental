package org.web.products.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceHistoryResponse {
    private Long id;
    private String priceType; // RENT, SALE
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private double percentChange;
    private String changeType; // INCREASE, DECREASE
    private String changedBy;
    private LocalDateTime createdAt;
}
