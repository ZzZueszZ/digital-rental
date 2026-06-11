package org.web.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatResponse {
    private LocalDate date;
    private BigDecimal revenue;
    private BigDecimal purchaseRevenue;
    private BigDecimal rentalRevenue;

    public RevenueStatResponse(LocalDate date, BigDecimal revenue) {
        this.date = date;
        this.revenue = revenue;
        this.purchaseRevenue = BigDecimal.ZERO;
        this.rentalRevenue = BigDecimal.ZERO;
    }
}
