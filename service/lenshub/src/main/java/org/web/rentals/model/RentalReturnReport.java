package org.web.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.model.BaseAuditEntity;
import org.web.users.model.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_return_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalReturnReport extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_order_id", nullable = false)
    private RentalOrder rentalOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;

    @Column(name = "return_date")
    private LocalDateTime returnDate;

    @Column(name = "body_condition_after", length = 255)
    private String bodyConditionAfter;

    @Column(name = "lens_condition_after", length = 255)
    private String lensConditionAfter;

    @Column(name = "battery_condition_after", length = 255)
    private String batteryConditionAfter;

    @Column(name = "accessory_condition_after", length = 255)
    private String accessoryConditionAfter;

    @Column(name = "late_days")
    @Builder.Default
    private int lateDays = 0;

    @Column(name = "late_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal lateFee = BigDecimal.ZERO;

    @Column(name = "damage_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal damageFee = BigDecimal.ZERO;

    @Column(name = "missing_accessory_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal missingAccessoryFee = BigDecimal.ZERO;

    @Column(name = "total_penalty", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalPenalty = BigDecimal.ZERO;

    @Column(name = "refund_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "extra_payment_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal extraPaymentAmount = BigDecimal.ZERO;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
