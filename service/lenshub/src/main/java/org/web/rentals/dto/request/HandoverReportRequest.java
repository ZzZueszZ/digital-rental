package org.web.rentals.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.RiskLevel;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Getter
@Setter
public class HandoverReportRequest {

    private String serialNumber;
    private String bodyCondition;
    private String lensCondition;
    private String batteryCondition;
    private String accessoryCondition;

    @NotNull(message = "Risk level is required")
    private RiskLevel riskLevel;

    @NotNull(message = "Final deposit amount is required")
    private BigDecimal finalDepositAmount;

    private PaymentMethod depositPaymentMethod;
    private String note;
}
