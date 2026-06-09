package org.web.identity.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.web.common.enums.RiskLevel;
import org.web.identity.model.UserIdentity;
import org.web.identity.repository.UserIdentityRepository;
import org.web.identity.service.provider.KycFaceMatchResult;
import org.web.identity.service.provider.KycLivenessResult;
import org.web.identity.service.provider.KycOcrResult;
import org.web.users.model.User;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KycRiskScoringServiceTest {

    @Mock
    private UserIdentityRepository userIdentityRepository;

    @InjectMocks
    private KycRiskScoringService service;

    @Test
    void assessReturnsLowRiskForCompleteValidResult() {
        User user = User.builder().id(1L).build();
        KycOcrResult ocr = validOcr().build();
        KycFaceMatchResult face = KycFaceMatchResult.builder()
                .similarity(94)
                .matched(true)
                .build();

        when(userIdentityRepository.findByIdentityNumber("012345678901")).thenReturn(Optional.empty());

        KycRiskAssessmentResult result = service.assess(user, ocr, face);

        assertThat(result.getRiskLevel()).isEqualTo(RiskLevel.LOW_RISK);
        assertThat(result.getRiskScore()).isZero();
        assertThat(result.isDocumentValid()).isTrue();
        assertThat(result.isManualReviewRequired()).isTrue();
    }

    @Test
    void assessReturnsHighRiskForFaceFailAndDuplicateIdentity() {
        User user = User.builder().id(1L).build();
        User otherUser = User.builder().id(2L).build();
        UserIdentity existingIdentity = UserIdentity.builder()
                .user(otherUser)
                .identityNumber("012345678901")
                .build();
        KycFaceMatchResult face = KycFaceMatchResult.builder()
                .similarity(52)
                .matched(false)
                .build();

        when(userIdentityRepository.findByIdentityNumber("012345678901")).thenReturn(Optional.of(existingIdentity));

        KycRiskAssessmentResult result = service.assess(user, validOcr().build(), face);

        assertThat(result.getRiskLevel()).isEqualTo(RiskLevel.HIGH_RISK);
        assertThat(result.getRiskScore()).isGreaterThanOrEqualTo(70);
        assertThat(result.getReason()).contains("Face match failed", "Identity number already used");
        assertThat(result.isDocumentValid()).isFalse();
    }

    @Test
    void assessReturnsHighRiskForFailedLiveness() {
        User user = User.builder().id(1L).build();
        KycFaceMatchResult face = KycFaceMatchResult.builder()
                .similarity(94)
                .matched(true)
                .build();
        KycLivenessResult liveness = KycLivenessResult.builder()
                .score(0.42)
                .passed(false)
                .spoofDetected(true)
                .multipleFacesDetected(false)
                .build();

        when(userIdentityRepository.findByIdentityNumber("012345678901")).thenReturn(Optional.empty());

        KycRiskAssessmentResult result = service.assess(user, validOcr().build(), face, liveness);

        assertThat(result.getRiskLevel()).isEqualTo(RiskLevel.HIGH_RISK);
        assertThat(result.getReason()).contains("Liveness failed", "Spoof detected");
        assertThat(result.isDocumentValid()).isFalse();
    }

    private KycOcrResult.KycOcrResultBuilder validOcr() {
        return KycOcrResult.builder()
                .identityNumber("012345678901")
                .fullName("Nguyen Van A")
                .dateOfBirth(LocalDate.of(1998, 1, 15))
                .placeOfResidence("Ho Chi Minh")
                .expiryDate(LocalDate.now().plusYears(5))
                .confidence(0.96);
    }
}
