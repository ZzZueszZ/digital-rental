package org.web.identity.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.web.common.enums.RiskLevel;
import org.web.common.enums.VerificationArtifactType;
import org.web.common.exceptions.ApplicationException;
import org.web.identity.dto.request.SubmitKycRequest;
import org.web.identity.model.VerificationArtifact;
import org.web.identity.model.VerificationResult;
import org.web.identity.model.VerificationSession;
import org.web.identity.repository.FaceVerificationResultRepository;
import org.web.identity.repository.RiskAssessmentRepository;
import org.web.identity.repository.VerificationArtifactRepository;
import org.web.identity.repository.VerificationResultRepository;
import org.web.identity.service.provider.KycFaceMatchResult;
import org.web.identity.service.provider.KycLivenessResult;
import org.web.identity.service.provider.KycProvider;
import org.web.identity.service.provider.UploadedFileResolver;
import org.web.users.model.User;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KycVerificationProcessorTest {

    @Mock private KycProviderRegistry providerRegistry;
    @Mock private KycRiskScoringService riskScoringService;
    @Mock private VerificationArtifactRepository artifactRepository;
    @Mock private VerificationResultRepository verificationResultRepository;
    @Mock private FaceVerificationResultRepository faceVerificationResultRepository;
    @Mock private RiskAssessmentRepository riskAssessmentRepository;
    @Mock private UploadedFileResolver uploadedFileResolver;
    @Mock private KycProvider provider;

    @InjectMocks private KycVerificationProcessor processor;

    @Test
    void processReusesIncompletePreviewWithoutCallingOcrAgain() {
        VerificationSession session = VerificationSession.builder().id(10L).build();
        User user = User.builder().id(20L).build();
        SubmitKycRequest request = request();
        VerificationResult preview = VerificationResult.builder()
                .verificationSession(session)
                .ocrProvider("fpt")
                .ocrConfidence(0.55)
                .rawOcrJson("{\"errorCode\":0}")
                .build();
        KycFaceMatchResult face = KycFaceMatchResult.builder().similarity(90).matched(true).build();
        KycLivenessResult liveness = KycLivenessResult.builder().score(0.9).passed(true).build();
        KycRiskAssessmentResult risk = KycRiskAssessmentResult.builder()
                .riskLevel(RiskLevel.HIGH_RISK)
                .riskScore(80)
                .manualReviewRequired(true)
                .documentValid(false)
                .reason("Missing OCR fields")
                .build();

        when(verificationResultRepository.findByVerificationSessionId(10L)).thenReturn(Optional.of(preview));
        when(artifactRepository.findByVerificationSessionIdAndArtifactType(10L, VerificationArtifactType.CCCD_FRONT))
                .thenReturn(Optional.of(artifact(session, VerificationArtifactType.CCCD_FRONT, request.getFrontImageUrl())));
        when(artifactRepository.findByVerificationSessionIdAndArtifactType(10L, VerificationArtifactType.CCCD_BACK))
                .thenReturn(Optional.of(artifact(session, VerificationArtifactType.CCCD_BACK, request.getBackImageUrl())));
        when(artifactRepository.findByVerificationSessionIdAndArtifactType(10L, VerificationArtifactType.SELFIE_IMAGE))
                .thenReturn(Optional.empty());
        when(artifactRepository.findByVerificationSessionIdAndArtifactType(10L, VerificationArtifactType.SELFIE_VIDEO))
                .thenReturn(Optional.empty());
        when(providerRegistry.activeProvider()).thenReturn(provider);
        when(provider.name()).thenReturn("fpt");
        when(provider.verifyFace(request.getFrontImageUrl(), request.getSelfieImageUrl())).thenReturn(face);
        when(provider.verifyLiveness(request.getLivenessVideoUrl(), request.getFrontImageUrl())).thenReturn(liveness);
        when(riskScoringService.assess(any(), any(), any(), any())).thenReturn(risk);
        when(faceVerificationResultRepository.findByVerificationSessionId(10L)).thenReturn(Optional.empty());
        when(riskAssessmentRepository.findByVerificationSessionId(10L)).thenReturn(Optional.empty());

        processor.process(session, user, request);

        verify(provider, never()).verifyOcr(any(), any());
        verify(provider).verifyFace(request.getFrontImageUrl(), request.getSelfieImageUrl());
        verify(provider).verifyLiveness(request.getLivenessVideoUrl(), request.getFrontImageUrl());
        verify(verificationResultRepository).save(preview);
    }

    @Test
    void processFailsBeforeProviderCallsWhenPreviewIsMissing() {
        VerificationSession session = VerificationSession.builder().id(10L).build();
        when(verificationResultRepository.findByVerificationSessionId(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> processor.process(session, User.builder().id(20L).build(), request()))
                .isInstanceOfSatisfying(ApplicationException.class, exception -> {
                    assertThat(exception.getHttpStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getMessage()).isEqualTo("OCR preview is required before KYC submission");
                });

        verifyNoInteractions(providerRegistry, provider, artifactRepository, riskScoringService);
    }

    @Test
    void processRejectsSubmitWhenIdentityImagesDifferFromPreview() {
        VerificationSession session = VerificationSession.builder().id(10L).build();
        SubmitKycRequest request = request();
        VerificationResult preview = VerificationResult.builder()
                .verificationSession(session)
                .ocrProvider("fpt")
                .ocrConfidence(0.96)
                .build();
        when(verificationResultRepository.findByVerificationSessionId(10L)).thenReturn(Optional.of(preview));
        when(artifactRepository.findByVerificationSessionIdAndArtifactType(10L, VerificationArtifactType.CCCD_FRONT))
                .thenReturn(Optional.of(artifact(session, VerificationArtifactType.CCCD_FRONT, "/api/uploads/old-front.jpg")));
        when(artifactRepository.findByVerificationSessionIdAndArtifactType(10L, VerificationArtifactType.CCCD_BACK))
                .thenReturn(Optional.of(artifact(session, VerificationArtifactType.CCCD_BACK, request.getBackImageUrl())));

        assertThatThrownBy(() -> processor.process(session, User.builder().id(20L).build(), request))
                .isInstanceOfSatisfying(ApplicationException.class, exception -> {
                    assertThat(exception.getHttpStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getMessage()).isEqualTo("OCR preview does not match submitted identity images");
                });

        verifyNoInteractions(providerRegistry, provider, riskScoringService);
        verify(artifactRepository, never()).save(any());
    }

    private SubmitKycRequest request() {
        SubmitKycRequest request = new SubmitKycRequest();
        request.setFrontImageUrl("/api/uploads/front.jpg");
        request.setBackImageUrl("/api/uploads/back.jpg");
        request.setSelfieImageUrl("/api/uploads/selfie.jpg");
        request.setLivenessVideoUrl("/api/uploads/liveness.webm");
        return request;
    }

    private VerificationArtifact artifact(
            VerificationSession session,
            VerificationArtifactType type,
            String storageKey
    ) {
        return VerificationArtifact.builder()
                .verificationSession(session)
                .artifactType(type)
                .storageKey(storageKey)
                .build();
    }
}
