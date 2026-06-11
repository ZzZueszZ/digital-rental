package org.web.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.PaymentStatus;
import org.web.common.enums.RentalOrderStatus;
import org.web.common.model.BaseAuditEntity;
import org.web.users.model.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rental_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalOrder extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RentalOrderStatus status;

    @Column(name = "rental_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal rentalFee;

    @Column(name = "estimated_deposit_amount", precision = 12, scale = 2)
    private BigDecimal estimatedDepositAmount;

    @Column(name = "final_deposit_amount", precision = 12, scale = 2)
    private BigDecimal finalDepositAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_status", length = 30)
    private org.web.common.enums.DepositStatus depositStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", length = 30)
    private org.web.common.enums.RiskLevel riskLevel;

    @Column(name = "additional_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal additionalFee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus;

    @Column(name = "rental_fee_paid_at")
    private LocalDateTime rentalFeePaidAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_status", length = 30)
    private PaymentStatus refundStatus;

    // Snapshot of Delivery information
    @Column(nullable = false, length = 100)
    private String shippingName;

    @Column(nullable = false, length = 20)
    private String shippingPhone;

    @Column(nullable = false, length = 255)
    private String shippingAddress;

    private LocalDateTime handedOverAt;
    private LocalDateTime returnedAt;
    private LocalDateTime completedAt;
    private LocalDateTime canceledAt;

    private String paymentTransactionNo;
    private String paymentResponseCode;

    @Lob
    private String paymentRawPayload;

    @OneToMany(mappedBy = "rentalOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RentalOrderItem> items = new ArrayList<>();

    @OneToOne(mappedBy = "rentalOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private RentalContract contract;

    @OneToOne(mappedBy = "rentalOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private RentalHandoverReport handoverReport;

    @OneToOne(mappedBy = "rentalOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private RentalReturnReport returnReport;
}
