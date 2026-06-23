package org.web.orders.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.OrderStatus;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class OrderResponse {
    private Long id;
    private String code;
    private Long userId;
    private String userEmail;
    
    private BigDecimal totalPrice;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal shippingDiscount;
    private String voucherCode;

    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;

    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;

    private LocalDateTime confirmedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime completedAt;
    private LocalDateTime canceledAt;
    private LocalDateTime createdAt;

    private String cancelReason;
    private String canceledBy;
    private Boolean refundRequired;
    private String refundNote;
    
    private Boolean isReviewed;
    private List<OrderItemResponse> items;
}
