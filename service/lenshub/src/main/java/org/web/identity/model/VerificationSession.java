package org.web.identity.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.enums.VerificationSessionStatus;
import org.web.common.enums.VerificationType;
import org.web.common.model.BaseAuditEntity;
import org.web.users.model.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationSession extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private VerificationSessionStatus status = VerificationSessionStatus.CREATED;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_type", nullable = false, length = 30)
    @Builder.Default
    private VerificationType verificationType = VerificationType.KYC_CCCD_SELFIE;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "failure_reason", length = 1000)
    private String failureReason;

    @Column(name = "review_note", length = 1000)
    private String reviewNote;
}
