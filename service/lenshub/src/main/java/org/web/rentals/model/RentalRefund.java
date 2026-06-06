package org.web.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.PaymentStatus;
import org.web.common.model.BaseAuditEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_refunds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRefund extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_order_id", nullable = false)
    private RentalOrder rentalOrder;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_method", length = 30)
    private PaymentMethod refundMethod;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
