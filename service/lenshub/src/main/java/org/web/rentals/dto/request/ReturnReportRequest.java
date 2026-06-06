package org.web.rentals.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ReturnReportRequest {

    private String bodyConditionAfter;
    private String lensConditionAfter;
    private String batteryConditionAfter;
    private String accessoryConditionAfter;

    private int lateDays;
    private BigDecimal lateFee;
    private BigDecimal damageFee;
    private BigDecimal missingAccessoryFee;

    private String note;
}
