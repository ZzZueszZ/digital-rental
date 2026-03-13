package org.web.identity.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.web.common.enums.RiskLevel;

import java.time.LocalDateTime;

@Entity
@Table(name = "risk_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_session_id", nullable = false, unique = true)
    private VerificationSession verificationSession;

    @Column(name = "risk_score")
    private Double riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", length = 20)
    private RiskLevel riskLevel;

    @Column(name = "device_fingerprint_match")
    private Boolean deviceFingerprintMatch;

    @Column(name = "ip_risk_flag")
    private Boolean ipRiskFlag;

    @Column(name = "blacklist_hit")
    private Boolean blacklistHit;

    @Column(name = "manual_review_required")
    private Boolean manualReviewRequired;

    @Column(name = "reason", length = 1000)
    private String reason;

    @CreationTimestamp
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
}
