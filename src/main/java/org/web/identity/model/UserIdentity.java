package org.web.identity.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.web.common.enums.DocumentType;
import org.web.common.enums.Gender;
import org.web.common.enums.IdentityVerificationStatus;
import org.web.users.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_identities",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_identities_user_id", columnNames = "user_id"),
        @UniqueConstraint(name = "uk_user_identities_identity_number", columnNames = "identity_number")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserIdentity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private DocumentType documentType;

    @Column(name = "identity_number", nullable = false, length = 50)
    private String identityNumber;

    @Column(name = "full_name", length = 200)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20)
    private Gender gender;

    @Column(name = "nationality", length = 100)
    private String nationality;

    @Column(name = "place_of_origin", length = 255)
    private String placeOfOrigin;

    @Column(name = "place_of_residence", length = 255)
    private String placeOfResidence;

    @Column(name = "issued_date")
    private LocalDate issuedDate;

    @Column(name = "issued_place", length = 255)
    private String issuedPlace;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "identity_verification_status", nullable = false, length = 30)
    @Builder.Default
    private IdentityVerificationStatus identityVerificationStatus = IdentityVerificationStatus.NOT_VERIFIED;

    @Column(name = "ocr_extracted", nullable = false)
    @Builder.Default
    private boolean ocrExtracted = false;

    @Column(name = "manual_verified", nullable = false)
    @Builder.Default
    private boolean manualVerified = false;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
