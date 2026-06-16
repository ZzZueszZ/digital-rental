package org.web.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopProductResponse {
    private Long productId;
    private String productName;
    private String brand;
    private String imageUrl;
    private Long totalSold;
    private Long totalRented;
    private BigDecimal revenue;

    public TopProductResponse(Long productId, String productName, String brand, String imageUrl,
                              Long totalSold, BigDecimal revenue) {
        this.productId = productId;
        this.productName = productName;
        this.brand = brand;
        this.imageUrl = imageUrl;
        this.totalSold = totalSold;
        this.totalRented = 0L;
        this.revenue = revenue;
    }
}
