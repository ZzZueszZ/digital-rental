package org.web.identity.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.web.common.enums.RiskLevel;
import org.web.identity.model.UserIdentity;
import org.web.identity.repository.UserIdentityRepository;
import org.web.identity.service.provider.KycFaceMatchResult;
import org.web.identity.service.provider.KycLivenessResult;
import org.web.identity.service.provider.KycOcrResult;
import org.web.users.model.User;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KycRiskScoringService {

    private final UserIdentityRepository userIdentityRepository;

    public KycRiskAssessmentResult assess(User user, KycOcrResult extracted, KycFaceMatchResult faceMatch) {
        return assess(user, extracted, faceMatch, null);
    }

    public KycRiskAssessmentResult assess(
            User user,
            KycOcrResult extracted,
            KycFaceMatchResult faceMatch,
            KycLivenessResult liveness
    ) {
        List<String> reasons = new ArrayList<>();
        double score = 0;

        if (isBlank(extracted.getIdentityNumber())) addRisk(reasons, "Missing identity number");
        if (isBlank(extracted.getFullName())) addRisk(reasons, "Missing full name");
        if (extracted.getDateOfBirth() == null) addRisk(reasons, "Missing date of birth");
        if (isBlank(extracted.getPlaceOfResidence())) addRisk(reasons, "Missing residence");

        if (extracted.getExpiryDate() != null && extracted.getExpiryDate().isBefore(LocalDate.now())) {
            reasons.add("Document expired");
            score += 35;
        }
        if (extracted.getConfidence() < 0.70) {
            reasons.add("OCR confidence too low");
            score += 30;
        } else if (extracted.getConfidence() < 0.90) {
            reasons.add("OCR confidence needs review");
            score += 15;
        }
        if (!faceMatch.isMatched() || faceMatch.getSimilarity() < 80) {
            reasons.add("Face match failed");
            score += 35;
        }
        if (liveness != null && (!liveness.isPassed() || liveness.getScore() < 0.80)) {
            reasons.add("Liveness failed");
            score += 45;
        }
        if (liveness != null && liveness.isSpoofDetected()) {
            reasons.add("Spoof detected");
            score += 45;
        }
        if (liveness != null && liveness.isMultipleFacesDetected()) {
            reasons.add("Multiple faces detected in liveness video");
            score += 30;
        }
        if (!isBlank(extracted.getIdentityNumber())) {
            userIdentityRepository.findByIdentityNumber(extracted.getIdentityNumber())
                    .filter(identity -> !sameUser(identity, user))
                    .ifPresent(identity -> {
                        reasons.add("Identity number already used");
                    });
            if (reasons.contains("Identity number already used")) {
                score += 40;
            }
        }

        long missingRequired = reasons.stream().filter(reason -> reason.startsWith("Missing")).count();
        score += missingRequired * 20;
        RiskLevel level = score >= 70 ? RiskLevel.HIGH_RISK : score >= 25 ? RiskLevel.MEDIUM_RISK : RiskLevel.LOW_RISK;

        return KycRiskAssessmentResult.builder()
                .riskScore(Math.min(score, 100))
                .riskLevel(level)
                .manualReviewRequired(true)
                .documentValid(level != RiskLevel.HIGH_RISK)
                .reason(reasons.isEmpty() ? "Extracted data passed MVP validation" : String.join("; ", reasons))
                .build();
    }

    private void addRisk(List<String> reasons, String reason) {
        reasons.add(reason);
    }

    private boolean sameUser(UserIdentity identity, User user) {
        return identity.getUser() != null && identity.getUser().getId().equals(user.getId());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
