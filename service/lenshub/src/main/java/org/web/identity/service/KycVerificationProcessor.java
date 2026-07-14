package org.web.identity.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.web.common.enums.VerificationArtifactStatus;
import org.web.common.enums.VerificationArtifactType;
import org.web.common.exceptions.ApplicationException;
import org.web.common.utils.FileUploadUtil;
import org.web.identity.dto.request.SubmitKycRequest;
import org.web.identity.model.*;
import org.web.identity.repository.*;
import org.web.identity.service.provider.*;
import org.web.users.model.User;

import java.nio.file.Path;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycVerificationProcessor {

    private final KycProviderRegistry providerRegistry;
    private final KycRiskScoringService riskScoringService;
    private final VerificationArtifactRepository artifactRepository;
    private final VerificationResultRepository verificationResultRepository;
    private final FaceVerificationResultRepository faceVerificationResultRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final UploadedFileResolver uploadedFileResolver;

    public void process(VerificationSession session, User user, SubmitKycRequest request) {
        VerificationResult preview = verificationResultRepository.findByVerificationSessionId(session.getId())
                .orElseThrow(() -> new ApplicationException(
                        HttpStatus.CONFLICT,
                        "OCR preview is required before KYC submission"
                ));
        requireMatchingPreviewArtifacts(session, request);

        log.debug("KYC processor saving artifacts: userId={}, sessionId={}", user.getId(), session.getId());
        saveArtifact(session, VerificationArtifactType.CCCD_FRONT, request.getFrontImageUrl());
        saveArtifact(session, VerificationArtifactType.CCCD_BACK, request.getBackImageUrl());
        saveArtifact(session, VerificationArtifactType.SELFIE_IMAGE, request.getSelfieImageUrl());
        saveArtifact(session, VerificationArtifactType.SELFIE_VIDEO, request.getLivenessVideoUrl());

        validateLivenessVideo(request.getLivenessVideoUrl());

        KycProvider provider = providerRegistry.activeProvider();
        log.info("KYC provider selected: userId={}, sessionId={}, provider={}",
                user.getId(), session.getId(), provider.name());
        String providerName = preview.getOcrProvider() != null ? preview.getOcrProvider() : provider.name();
        KycOcrResult extracted = fromVerificationResult(preview);
        KycFaceMatchResult face = provider.verifyFace(request.getFrontImageUrl(), request.getSelfieImageUrl());
        KycLivenessResult liveness = provider.verifyLiveness(request.getLivenessVideoUrl(), request.getFrontImageUrl());
        log.debug("KYC submit reused OCR preview: userId={}, sessionId={}, provider={}",
                user.getId(), session.getId(), providerName);
        KycRiskAssessmentResult risk = riskScoringService.assess(user, extracted, face, liveness);
        log.info("KYC risk assessed: userId={}, sessionId={}, riskLevel={}, riskScore={}, reason={}",
                user.getId(), session.getId(), risk.getRiskLevel(), risk.getRiskScore(), risk.getReason());

        saveOcrResult(session, providerName, extracted, risk);
        saveFaceResult(session, face, liveness);
        saveRisk(session, risk);
        log.debug("KYC processor persisted results: userId={}, sessionId={}", user.getId(), session.getId());
    }

    private void validateLivenessVideo(String storageKey) {
        if (storageKey.startsWith("/api/uploads/")) {
            return;
        }
        Path temporaryVideo = uploadedFileResolver.resolve(storageKey);
        try {
            String fileName = temporaryVideo.getFileName().toString();
            int dot = fileName.lastIndexOf('.');
            FileUploadUtil.validateLivenessVideoPath(temporaryVideo, dot >= 0 ? fileName.substring(dot + 1) : "");
        } finally {
            uploadedFileResolver.cleanup(temporaryVideo);
        }
    }

    private KycOcrResult fromVerificationResult(VerificationResult result) {
        return KycOcrResult.builder()
                .identityNumber(result.getExtractedIdentityNumber())
                .fullName(result.getExtractedFullName())
                .dateOfBirth(result.getExtractedDateOfBirth())
                .gender(result.getExtractedGender())
                .nationality(result.getExtractedNationality())
                .placeOfOrigin(result.getExtractedPlaceOfOrigin())
                .placeOfResidence(result.getExtractedPlaceOfResidence())
                .issuedDate(result.getExtractedIssuedDate())
                .expiryDate(result.getExtractedExpiryDate())
                .confidence(result.getOcrConfidence())
                .documentType(null)
                .successful(Boolean.TRUE.equals(result.getDocumentValid()))
                .rawResponse(result.getRawOcrJson())
                .build();
    }

    private void requireMatchingPreviewArtifacts(VerificationSession session, SubmitKycRequest request) {
        boolean frontMatches = artifactRepository
                .findByVerificationSessionIdAndArtifactType(session.getId(), VerificationArtifactType.CCCD_FRONT)
                .map(artifact -> Objects.equals(artifact.getStorageKey(), request.getFrontImageUrl()))
                .orElse(false);
        boolean backMatches = artifactRepository
                .findByVerificationSessionIdAndArtifactType(session.getId(), VerificationArtifactType.CCCD_BACK)
                .map(artifact -> Objects.equals(artifact.getStorageKey(), request.getBackImageUrl()))
                .orElse(false);
        if (!frontMatches || !backMatches) {
            throw new ApplicationException(
                    HttpStatus.CONFLICT,
                    "OCR preview does not match submitted identity images"
            );
        }
    }

    private void saveOcrResult(VerificationSession session, String provider, KycOcrResult ocr, KycRiskAssessmentResult risk) {
        VerificationResult result = verificationResultRepository.findByVerificationSessionId(session.getId())
                .orElseGet(() -> VerificationResult.builder().verificationSession(session).build());
        result.setOcrProvider(provider);
        result.setOcrConfidence(ocr.getConfidence());
        result.setDecisionSource(null);
        result.setDocumentValid(risk.isDocumentValid());
        result.setDocumentTampered(false);
        result.setFieldsMatchProfile(risk.isDocumentValid());
        result.setExtractedFullName(ocr.getFullName());
        result.setExtractedIdentityNumber(ocr.getIdentityNumber());
        result.setExtractedDateOfBirth(ocr.getDateOfBirth());
        result.setExtractedGender(ocr.getGender());
        result.setExtractedNationality(ocr.getNationality());
        result.setExtractedPlaceOfOrigin(ocr.getPlaceOfOrigin());
        result.setExtractedPlaceOfResidence(ocr.getPlaceOfResidence());
        result.setExtractedIssuedDate(ocr.getIssuedDate());
        result.setExtractedExpiryDate(ocr.getExpiryDate());
        result.setRawOcrJson(ocr.getRawResponse());
        verificationResultRepository.save(result);
    }

    private void saveFaceResult(VerificationSession session, KycFaceMatchResult face, KycLivenessResult liveness) {
        FaceVerificationResult result = faceVerificationResultRepository.findByVerificationSessionId(session.getId())
                .orElseGet(() -> FaceVerificationResult.builder().verificationSession(session).build());
        result.setFaceMatchScore(face.getSimilarity() / 100);
        result.setFaceMatchPassed(face.isMatched());
        if (liveness != null) {
            result.setLivenessScore(liveness.getScore());
            result.setLivenessPassed(liveness.isPassed());
            result.setSpoofDetected(liveness.isSpoofDetected());
            result.setMultipleFacesDetected(liveness.isMultipleFacesDetected());
        } else {
            result.setLivenessScore(null);
            result.setLivenessPassed(null);
            result.setSpoofDetected(false);
            result.setMultipleFacesDetected(false);
        }
        result.setFaceQualityScore(face.getSimilarity() / 100);
        faceVerificationResultRepository.save(result);
    }

    private void saveRisk(VerificationSession session, KycRiskAssessmentResult risk) {
        RiskAssessment result = riskAssessmentRepository.findByVerificationSessionId(session.getId())
                .orElseGet(() -> RiskAssessment.builder().verificationSession(session).build());
        result.setRiskScore(risk.getRiskScore());
        result.setRiskLevel(risk.getRiskLevel());
        result.setDeviceFingerprintMatch(true);
        result.setIpRiskFlag(false);
        result.setBlacklistHit(false);
        result.setManualReviewRequired(risk.isManualReviewRequired());
        result.setReason(risk.getReason());
        riskAssessmentRepository.save(result);
    }

    private void saveArtifact(VerificationSession session, VerificationArtifactType type, String url) {
        VerificationArtifact artifact = artifactRepository.findByVerificationSessionIdAndArtifactType(session.getId(), type)
                .orElseGet(() -> VerificationArtifact.builder()
                        .verificationSession(session)
                        .artifactType(type)
                        .build());
        artifact.setArtifactStatus(VerificationArtifactStatus.UPLOADED);
        artifact.setStorageKey(url);
        artifact.setOriginalFileName(url.substring(url.lastIndexOf('/') + 1));
        artifact.setMimeType(type == VerificationArtifactType.SELFIE_VIDEO ? "video/webm" : "image/jpeg");
        artifact.setFileSize(1024L);
        artifactRepository.save(artifact);
    }

}
