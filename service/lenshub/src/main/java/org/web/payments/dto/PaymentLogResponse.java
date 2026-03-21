package org.web.payments.dto;

import lombok.Builder;
import lombok.Data;
import org.web.common.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentLogResponse {
    private Long id;
    private Long orderId;
    private String orderCode;
    private String provider;
    private PaymentStatus status;
    private BigDecimal amount;
    private String currency;
    private String transactionId;
    private String responseCode;
    private String note;
    private LocalDateTime createdAt;
}
