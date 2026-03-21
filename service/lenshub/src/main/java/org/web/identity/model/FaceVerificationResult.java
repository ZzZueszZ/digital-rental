package org.web.identity.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "face_verification_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceVerificationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_session_id", nullable = false, unique = true)
    private VerificationSession verificationSession;

    @Column(name = "face_match_score")
    private Double faceMatchScore;

    @Column(name = "face_match_passed")
    private Boolean faceMatchPassed;

    @Column(name = "liveness_score")
    private Double livenessScore;

    @Column(name = "liveness_passed")
    private Boolean livenessPassed;

    @Column(name = "spoof_detected")
    private Boolean spoofDetected;

    @Column(name = "multiple_faces_detected")
    private Boolean multipleFacesDetected;

    @Column(name = "face_quality_score")
    private Double faceQualityScore;

    @CreationTimestamp
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
}
