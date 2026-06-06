package org.web.rentals.dto.response;

import lombok.*;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.RiskLevel;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalHandoverReportResponse {
    private Long id;
    private String serialNumber;
    private String bodyCondition;
    private String lensCondition;
    private String batteryCondition;
    private String accessoryCondition;
    private RiskLevel riskLevel;
    private BigDecimal finalDepositAmount;
    private PaymentMethod depositPaymentMethod;
    private String note;
    private String staffName;
    private LocalDateTime createdAt;
}
