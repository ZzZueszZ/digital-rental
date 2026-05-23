package org.web.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.model.BaseAuditEntity;

import java.time.LocalDateTime;

@Entity
@Table(name = "rental_contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalContract extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_order_id", nullable = false)
    private RentalOrder rentalOrder;

    @Column(name = "contract_number", nullable = false, unique = true, length = 100)
    private String contractNumber;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(name = "customer_signature", length = 255)
    private String customerSignature;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private boolean isLocked = false;
}
