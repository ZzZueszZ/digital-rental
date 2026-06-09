package org.web.identity.dto.response;

import lombok.*;
import org.web.common.enums.RiskLevel;
import org.web.common.enums.VerificationSessionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycSessionResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private VerificationSessionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    private String failureReason;
    private String reviewNote;

    // Extracted OCR fields
    private String identityNumber;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;
    private String placeOfOrigin;
    private String placeOfResidence;
    private LocalDate issuedDate;
    private LocalDate expiryDate;

    // AI matching details
    private Double faceMatchScore;
    private Boolean faceMatchPassed;
    private Double livenessScore;
    private Boolean livenessPassed;
    private Boolean spoofDetected;
    private Boolean multipleFacesDetected;
    private Double ocrConfidence;
    private Double riskScore;
    private RiskLevel riskLevel;
    private String riskReason;
    private Boolean manualReviewRequired;

    // Uploaded image urls
    private String frontImageUrl;
    private String backImageUrl;
    private String selfieImageUrl;
    private String livenessVideoUrl;
}
