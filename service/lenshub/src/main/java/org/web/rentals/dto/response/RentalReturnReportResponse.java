package org.web.rentals.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalReturnReportResponse {
    private Long id;
    private LocalDateTime returnDate;
    private String bodyConditionAfter;
    private String lensConditionAfter;
    private String batteryConditionAfter;
    private String accessoryConditionAfter;
    private int earlyReturnDays;
    private BigDecimal earlyReturnRefundAmount;
    private int lateDays;
    private BigDecimal lateFee;
    private BigDecimal damageFee;
    private BigDecimal missingAccessoryFee;
    private BigDecimal totalPenalty;
    private BigDecimal refundAmount;
    private BigDecimal extraPaymentAmount;
    private String note;
    private String staffName;
    private LocalDateTime createdAt;
}
