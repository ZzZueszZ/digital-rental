package org.web.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.RiskLevel;
import org.web.common.model.BaseAuditEntity;
import org.web.users.model.User;

import java.math.BigDecimal;

@Entity
@Table(name = "rental_handover_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalHandoverReport extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_order_id", nullable = false)
    private RentalOrder rentalOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "body_condition", length = 255)
    private String bodyCondition;

    @Column(name = "lens_condition", length = 255)
    private String lensCondition;

    @Column(name = "battery_condition", length = 255)
    private String batteryCondition;

    @Column(name = "accessory_condition", length = 255)
    private String accessoryCondition;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", length = 30)
    private RiskLevel riskLevel;

    @Column(name = "final_deposit_amount", precision = 12, scale = 2)
    private BigDecimal finalDepositAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_payment_method", length = 30)
    private PaymentMethod depositPaymentMethod;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
