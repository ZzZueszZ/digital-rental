package org.web.orders.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.enums.OrderStatus;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.PaymentStatus;
import org.web.common.model.BaseAuditEntity;
import org.web.users.model.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @Column(precision = 12, scale = 2)
    private BigDecimal shippingFee;

    @Column(precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal shippingDiscount;

    private String voucherCode;

    private String shippingVoucherCode;

    // Snapshot of Shipping information
    @Column(nullable = false, length = 100)
    private String shippingName;

    @Column(nullable = false, length = 20)
    private String shippingPhone;

    @Column(nullable = false, length = 255)
    private String shippingAddress;

    // Timestamps
    private LocalDateTime confirmedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime completedAt;
    private LocalDateTime canceledAt;

    @Lob
    private String cancelReason;

    @Column(length = 30)
    private String canceledBy;

    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean refundRequired = false;

    @Lob
    private String refundNote;
    
    private String paymentTransactionNo;
    private String paymentResponseCode;
    
    @Lob
    private String paymentRawPayload;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    public void markPaidByVnPay(String transactionNo, String responseCode, BigDecimal amount, String rawPayload) {
        this.paymentStatus = PaymentStatus.SUCCESS;
        this.paymentTransactionNo = transactionNo;
        this.paymentResponseCode = responseCode;
        this.paymentRawPayload = rawPayload;
    }

    public void markPaymentFailed(String provider, String responseCode, String rawPayload) {
        this.paymentStatus = PaymentStatus.FAILED;
        this.paymentResponseCode = responseCode;
        this.paymentRawPayload = rawPayload;
    }
}
