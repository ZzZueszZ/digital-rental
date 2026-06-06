package org.web.rentals.dto.response;

import lombok.*;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.PaymentStatus;
import org.web.common.enums.RentalOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalOrderResponse {
    private Long id;
    private String code;
    private Long userId;
    private String userEmail;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private RentalOrderStatus status;
    private BigDecimal rentalFee;
    private BigDecimal estimatedDepositAmount;
    private BigDecimal finalDepositAmount;
    private org.web.common.enums.DepositStatus depositStatus;
    private org.web.common.enums.RiskLevel riskLevel;
    private BigDecimal additionalFee;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private PaymentStatus refundStatus;
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private LocalDateTime handedOverAt;
    private LocalDateTime returnedAt;
    private LocalDateTime completedAt;
    private LocalDateTime canceledAt;
    private List<RentalOrderItemResponse> items;
    private RentalContractResponse contract;
    private RentalHandoverReportResponse handoverReport;
    private RentalReturnReportResponse returnReport;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
