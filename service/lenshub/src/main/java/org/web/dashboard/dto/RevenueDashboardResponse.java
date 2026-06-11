package org.web.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueDashboardResponse {
    private BigDecimal totalRevenue;
    private BigDecimal purchaseRevenue;
    private BigDecimal rentalRevenue;
    private Double growthRate;
    private Double purchaseGrowthRate;
    private Double rentalGrowthRate;
    private List<RevenueStatResponse> dailyStats;
}
