package org.web.identity.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.web.common.enums.ReviewAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_session_id", nullable = false)
    private VerificationSession verificationSession;

    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_action", nullable = false, length = 30)
    private ReviewAction reviewAction;

    @Column(name = "note", length = 1000)
    private String note;

    @CreationTimestamp
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
