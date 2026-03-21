package org.web.payments.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.web.common.enums.PaymentStatus;
import org.web.orders.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payment_transaction_logs")
public class PaymentTransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(length = 30)
    private String provider; // e.g. VNPAY

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentStatus status;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 3)
    private String currency;

    @Column(length = 100)
    private String transactionId;

    @Column(length = 100)
    private String orderCode;

    @Column(length = 50)
    private String responseCode;

    @Lob
    private String rawPayload;

    private String note;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
