package org.web.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.model.BaseAuditEntity;

import java.time.LocalDateTime;
import org.web.common.enums.ContractStatus;

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

    @Column(name = "contract_version", nullable = false)
    @Builder.Default
    private int contractVersion = 1;

    @Column(name = "contract_hash", length = 255)
    private String contractHash;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "signer_user_id")
    private Long signerUserId;

    @Column(name = "signer_ip", length = 50)
    private String signerIp;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ContractStatus status = ContractStatus.DRAFT;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private boolean isLocked = false;
}
