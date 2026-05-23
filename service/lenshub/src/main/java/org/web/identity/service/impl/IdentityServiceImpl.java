package org.web.identity.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.common.enums.*;
import org.web.common.exceptions.ApplicationException;
import org.web.identity.dto.request.ResolveKycRequest;
import org.web.identity.dto.request.SubmitKycRequest;
import org.web.identity.dto.response.KycSessionResponse;
import org.web.identity.model.*;
import org.web.identity.repository.*;
import org.web.identity.service.IdentityService;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IdentityServiceImpl implements IdentityService {

    private final VerificationSessionRepository verificationSessionRepository;
    private final UserIdentityRepository userIdentityRepository;
    private final VerificationArtifactRepository verificationArtifactRepository;
    private final FaceVerificationResultRepository faceVerificationResultRepository;
    private final VerificationResultRepository verificationResultRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public KycSessionResponse initiateKyc(User user) {
        // Cancel previous active sessions if any
        List<VerificationSession> activeSessions = verificationSessionRepository.findByUserId(user.getId());
        for (VerificationSession session : activeSessions) {
            if (session.getStatus() == VerificationSessionStatus.CREATED ||
                session.getStatus() == VerificationSessionStatus.UPLOADING ||
                session.getStatus() == VerificationSessionStatus.PROCESSING ||
                session.getStatus() == VerificationSessionStatus.PENDING_REVIEW) {
                session.setStatus(VerificationSessionStatus.CANCELLED);
                verificationSessionRepository.save(session);
            }
        }

        VerificationSession session = VerificationSession.builder()
                .user(user)
                .status(VerificationSessionStatus.CREATED)
                .verificationType(VerificationType.KYC_CCCD_SELFIE)
                .startedAt(LocalDateTime.now())
                .build();

        VerificationSession saved = verificationSessionRepository.save(session);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public KycSessionResponse submitKyc(User user, SubmitKycRequest request) {
        // Find active CREATED session or initiate new one
        List<VerificationSession> activeSessions = verificationSessionRepository.findByUserId(user.getId());
        VerificationSession session = activeSessions.stream()
                .filter(s -> s.getStatus() == VerificationSessionStatus.CREATED)
                .findFirst()
                .orElseGet(() -> VerificationSession.builder()
                        .user(user)
                        .status(VerificationSessionStatus.CREATED)
                        .verificationType(VerificationType.KYC_CCCD_SELFIE)
                        .startedAt(LocalDateTime.now())
                        .build());

        session.setStatus(VerificationSessionStatus.PROCESSING);
        session.setSubmittedAt(LocalDateTime.now());
        session = verificationSessionRepository.save(session);

        // 1. Save uploaded artifacts
        saveArtifact(session, VerificationArtifactType.CCCD_FRONT, request.getFrontImageUrl());
        saveArtifact(session, VerificationArtifactType.CCCD_BACK, request.getBackImageUrl());
        saveArtifact(session, VerificationArtifactType.SELFIE_IMAGE, request.getSelfieImageUrl());

        // 2. Perform Mock AI evaluation
        boolean isFailureCase = request.getIdentityNumber().startsWith("999") || request.getIdentityNumber().toUpperCase().contains("FAIL");

        double faceMatchScore = isFailureCase ? 0.65 : 0.95;
        boolean faceMatchPassed = faceMatchScore >= 0.90;
        double ocrConfidence = isFailureCase ? 0.60 : 0.96;
        boolean ocrPassed = ocrConfidence >= 0.90;

        // Save Face Verification Result
        FaceVerificationResult faceRes = FaceVerificationResult.builder()
                .verificationSession(session)
                .faceMatchScore(faceMatchScore)
                .faceMatchPassed(faceMatchPassed)
                .livenessScore(0.98)
                .livenessPassed(true)
                .spoofDetected(false)
                .multipleFacesDetected(false)
                .faceQualityScore(0.92)
                .build();
        faceVerificationResultRepository.save(faceRes);

        // Save OCR Verification Result
        VerificationResult ocrRes = VerificationResult.builder()
                .verificationSession(session)
                .ocrProvider("MockAI")
                .ocrConfidence(ocrConfidence)
                .decisionSource(isFailureCase ? DecisionSource.AI_AUTO_REJECTED : DecisionSource.AI_AUTO_APPROVED)
                .documentValid(ocrPassed)
                .documentTampered(false)
                .fieldsMatchProfile(true)
                .extractedFullName(request.getFullName())
                .extractedIdentityNumber(request.getIdentityNumber())
                .extractedDateOfBirth(request.getDateOfBirth())
                .extractedGender(request.getGender())
                .extractedNationality(request.getNationality())
                .extractedPlaceOfOrigin(request.getPlaceOfOrigin())
                .extractedPlaceOfResidence(request.getPlaceOfResidence())
                .extractedIssuedDate(request.getIssuedDate())
                .extractedExpiryDate(request.getExpiryDate())
                .build();
        verificationResultRepository.save(ocrRes);

        // Save Risk Assessment
        RiskAssessment risk = RiskAssessment.builder()
                .verificationSession(session)
                .riskScore(isFailureCase ? 85.0 : 5.0)
                .riskLevel(isFailureCase ? RiskLevel.HIGH : RiskLevel.LOW)
                .deviceFingerprintMatch(true)
                .ipRiskFlag(false)
                .blacklistHit(false)
                .manualReviewRequired(isFailureCase)
                .build();
        riskAssessmentRepository.save(risk);

        // 3. Update status based on AI score threshold (0.90)
        if (ocrPassed && faceMatchPassed) {
            session.setStatus(VerificationSessionStatus.APPROVED);
            session.setCompletedAt(LocalDateTime.now());
            verificationSessionRepository.save(session);

            // Update user status
            user.setKycStatus(KycStatus.VERIFIED);
            userRepository.save(user);

            // Save UserIdentity record
            saveUserIdentity(user, request);
        } else {
            // Low confidence -> fallback to manual review
            session.setStatus(VerificationSessionStatus.PENDING_REVIEW);
            verificationSessionRepository.save(session);

            user.setKycStatus(KycStatus.MANUAL_REVIEW);
            userRepository.save(user);
        }

        return mapToResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public KycSessionResponse getKycStatus(User user) {
        List<VerificationSession> sessions = verificationSessionRepository.findByUserId(user.getId());
        if (sessions.isEmpty()) {
            return KycSessionResponse.builder()
                    .userId(user.getId())
                    .userEmail(user.getEmail())
                    .status(VerificationSessionStatus.CREATED)
                    .build();
        }
        // Return latest session
        VerificationSession latest = sessions.stream()
                .max((s1, s2) -> s1.getCreatedAt().compareTo(s2.getCreatedAt()))
                .get();
        return mapToResponse(latest);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KycSessionResponse> getPendingKycSessions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<VerificationSession> pageResult = verificationSessionRepository.findByStatus(VerificationSessionStatus.PENDING_REVIEW, pageable);
        return pageResult.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public KycSessionResponse resolveKycSession(Long sessionId, ResolveKycRequest request) {
        VerificationSession session = verificationSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy phiên eKYC"));

        if (session.getStatus() != VerificationSessionStatus.PENDING_REVIEW) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Chỉ có thể phê duyệt/từ chối phiên eKYC ở trạng thái PENDING_REVIEW.");
        }

        User user = session.getUser();
        session.setReviewNote(request.getNote());
        session.setCompletedAt(LocalDateTime.now());

        if (request.getApproved()) {
            session.setStatus(VerificationSessionStatus.APPROVED);
            user.setKycStatus(KycStatus.VERIFIED);

            // Save User Identity record from extracted OCR results
            VerificationResult ocrRes = verificationResultRepository.findByVerificationSessionId(session.getId()).orElse(null);
            if (ocrRes != null) {
                SubmitKycRequest submitReq = new SubmitKycRequest();
                submitReq.setIdentityNumber(ocrRes.getExtractedIdentityNumber());
                submitReq.setFullName(ocrRes.getExtractedFullName());
                submitReq.setDateOfBirth(ocrRes.getExtractedDateOfBirth());
                submitReq.setGender(ocrRes.getExtractedGender());
                submitReq.setNationality(ocrRes.getExtractedNationality());
                submitReq.setPlaceOfOrigin(ocrRes.getExtractedPlaceOfOrigin());
                submitReq.setPlaceOfResidence(ocrRes.getExtractedPlaceOfResidence());
                submitReq.setIssuedDate(ocrRes.getExtractedIssuedDate());
                submitReq.setExpiryDate(ocrRes.getExtractedExpiryDate());
                saveUserIdentity(user, submitReq);
            }
        } else {
            session.setStatus(VerificationSessionStatus.REJECTED);
            session.setFailureReason(request.getNote());
            user.setKycStatus(KycStatus.REJECTED);
        }

        verificationSessionRepository.save(session);
        userRepository.save(user);

        return mapToResponse(session);
    }

    private void saveArtifact(VerificationSession session, VerificationArtifactType type, String url) {
        VerificationArtifact artifact = VerificationArtifact.builder()
                .verificationSession(session)
                .artifactType(type)
                .artifactStatus(VerificationArtifactStatus.UPLOADED)
                .storageKey(url)
                .originalFileName(url.substring(url.lastIndexOf('/') + 1))
                .mimeType("image/jpeg")
                .fileSize(1024L)
                .build();
        verificationArtifactRepository.save(artifact);
    }

    private void saveUserIdentity(User user, SubmitKycRequest request) {
        UserIdentity identity = userIdentityRepository.findByUserId(user.getId())
                .orElseGet(() -> UserIdentity.builder().user(user).build());

        identity.setDocumentType(DocumentType.CITIZEN_ID_CARD);
        identity.setIdentityNumber(request.getIdentityNumber());
        identity.setFullName(request.getFullName());
        identity.setDateOfBirth(request.getDateOfBirth());
        identity.setGender(parseGender(request.getGender()));
        identity.setNationality(request.getNationality());
        identity.setPlaceOfOrigin(request.getPlaceOfOrigin());
        identity.setPlaceOfResidence(request.getPlaceOfResidence());
        identity.setIssuedDate(request.getIssuedDate());
        identity.setExpiryDate(request.getExpiryDate());
        identity.setIdentityVerificationStatus(IdentityVerificationStatus.VERIFIED);
        identity.setOcrExtracted(true);
        identity.setManualVerified(true);
        identity.setVerifiedAt(LocalDateTime.now());

        userIdentityRepository.save(identity);
    }

    private Gender parseGender(String value) {
        if (value == null) return Gender.OTHER;
        try {
            return Gender.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Gender.OTHER;
        }
    }

    private KycSessionResponse mapToResponse(VerificationSession session) {
        KycSessionResponse.KycSessionResponseBuilder builder = KycSessionResponse.builder()
                .id(session.getId())
                .userId(session.getUser() != null ? session.getUser().getId() : null)
                .userEmail(session.getUser() != null ? session.getUser().getEmail() : null)
                .status(session.getStatus())
                .startedAt(session.getStartedAt())
                .submittedAt(session.getSubmittedAt())
                .completedAt(session.getCompletedAt())
                .failureReason(session.getFailureReason())
                .reviewNote(session.getReviewNote());

        // Fill in OCR details if available
        VerificationResult ocrRes = verificationResultRepository.findByVerificationSessionId(session.getId()).orElse(null);
        if (ocrRes != null) {
            builder.identityNumber(ocrRes.getExtractedIdentityNumber())
                   .fullName(ocrRes.getExtractedFullName())
                   .dateOfBirth(ocrRes.getExtractedDateOfBirth())
                   .gender(ocrRes.getExtractedGender())
                   .nationality(ocrRes.getExtractedNationality())
                   .placeOfOrigin(ocrRes.getExtractedPlaceOfOrigin())
                   .placeOfResidence(ocrRes.getExtractedPlaceOfResidence())
                   .issuedDate(ocrRes.getExtractedIssuedDate())
                   .expiryDate(ocrRes.getExtractedExpiryDate())
                   .ocrConfidence(ocrRes.getOcrConfidence());
        }

        // Fill in Face details if available
        FaceVerificationResult faceRes = faceVerificationResultRepository.findByVerificationSessionId(session.getId()).orElse(null);
        if (faceRes != null) {
            builder.faceMatchScore(faceRes.getFaceMatchScore())
                   .faceMatchPassed(faceRes.getFaceMatchPassed());
        }

        // Fill in image urls if available
        List<VerificationArtifact> artifacts = verificationArtifactRepository.findByVerificationSessionId(session.getId());
        for (VerificationArtifact art : artifacts) {
            if (art.getArtifactType() == VerificationArtifactType.CCCD_FRONT) {
                builder.frontImageUrl(art.getStorageKey());
            } else if (art.getArtifactType() == VerificationArtifactType.CCCD_BACK) {
                builder.backImageUrl(art.getStorageKey());
            } else if (art.getArtifactType() == VerificationArtifactType.SELFIE_IMAGE) {
                builder.selfieImageUrl(art.getStorageKey());
            }
        }

        return builder.build();
    }
}
