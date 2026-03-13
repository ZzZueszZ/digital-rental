package org.web.identity.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_session_id", nullable = false, unique = true)
    private VerificationSession verificationSession;

    @Column(name = "ocr_provider", length = 100)
    private String ocrProvider;

    @Column(name = "ocr_confidence")
    private Double ocrConfidence;

    @Column(name = "document_valid")
    private Boolean documentValid;

    @Column(name = "document_tampered")
    private Boolean documentTampered;

    @Column(name = "fields_match_profile")
    private Boolean fieldsMatchProfile;

    @Column(name = "extracted_full_name", length = 200)
    private String extractedFullName;

    @Column(name = "extracted_identity_number", length = 50)
    private String extractedIdentityNumber;

    @Column(name = "extracted_date_of_birth")
    private LocalDate extractedDateOfBirth;

    @Column(name = "extracted_gender", length = 20)
    private String extractedGender;

    @Column(name = "extracted_nationality", length = 100)
    private String extractedNationality;

    @Column(name = "extracted_place_of_origin", length = 255)
    private String extractedPlaceOfOrigin;

    @Column(name = "extracted_place_of_residence", length = 255)
    private String extractedPlaceOfResidence;

    @Column(name = "extracted_issued_date")
    private LocalDate extractedIssuedDate;

    @Column(name = "extracted_expiry_date")
    private LocalDate extractedExpiryDate;

    @Column(name = "raw_ocr_json", columnDefinition = "TEXT")
    private String rawOcrJson;

    @CreationTimestamp
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
}
