package org.web.rentals.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ReturnReportRequest {

    private LocalDateTime returnDate;

    private String bodyConditionAfter;
    private String lensConditionAfter;
    private String batteryConditionAfter;
    private String accessoryConditionAfter;

    private int earlyReturnDays;
    private int lateDays;
    private BigDecimal lateFee;
    private BigDecimal damageFee;
    private BigDecimal missingAccessoryFee;

    private String note;
    private java.util.Map<Long, String> itemConditions;
}
