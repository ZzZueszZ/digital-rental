package org.web.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.PaymentStatus;
import org.web.common.enums.RentalPaymentType;
import org.web.common.model.BaseAuditEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalPayment extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_order_id", nullable = false)
    private RentalOrder rentalOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 30)
    private RentalPaymentType paymentType;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_code", length = 100)
    private String transactionCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PaymentStatus status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
