package org.web.identity.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.web.identity.service.KycVerificationProcessor;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class IdentityServiceImpl implements IdentityService {

    private final VerificationSessionRepository verificationSessionRepository;
    private final UserIdentityRepository userIdentityRepository;
    private final VerificationArtifactRepository verificationArtifactRepository;
    private final FaceVerificationResultRepository faceVerificationResultRepository;
    private final VerificationResultRepository verificationResultRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final UserRepository userRepository;
    private final KycVerificationProcessor kycVerificationProcessor;

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
        log.info("KYC submit started: userId={}, email={}", user.getId(), user.getEmail());
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
        log.debug("KYC session marked PROCESSING: userId={}, sessionId={}", user.getId(), session.getId());

        try {
            kycVerificationProcessor.process(session, user, request);
        } catch (RuntimeException e) {
            log.error("KYC verification processing failed: userId={}, sessionId={}, message={}",
                    user.getId(), session.getId(), e.getMessage(), e);
            throw e;
        }

        // 3. Always set to PENDING_REVIEW for manual review by Admin/Staff (purely manual flow)
        session.setStatus(VerificationSessionStatus.PENDING_REVIEW);
        verificationSessionRepository.save(session);
        log.info("KYC session moved to PENDING_REVIEW: userId={}, sessionId={}", user.getId(), session.getId());

        // Update user status to PENDING (waiting for manual approval)
        user.setKycStatus(KycStatus.PENDING);
        userRepository.save(user);

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
                saveUserIdentity(user, ocrRes);
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

    private void saveUserIdentity(User user, VerificationResult ocrResult) {
        UserIdentity identity = userIdentityRepository.findByUserId(user.getId())
                .orElseGet(() -> UserIdentity.builder().user(user).build());

        identity.setDocumentType(DocumentType.CITIZEN_ID_CARD);
        identity.setIdentityNumber(ocrResult.getExtractedIdentityNumber());
        identity.setFullName(ocrResult.getExtractedFullName());
        identity.setDateOfBirth(ocrResult.getExtractedDateOfBirth());
        identity.setGender(parseGender(ocrResult.getExtractedGender()));
        identity.setNationality(ocrResult.getExtractedNationality());
        identity.setPlaceOfOrigin(ocrResult.getExtractedPlaceOfOrigin());
        identity.setPlaceOfResidence(ocrResult.getExtractedPlaceOfResidence());
        identity.setIssuedDate(ocrResult.getExtractedIssuedDate());
        identity.setExpiryDate(ocrResult.getExtractedExpiryDate());
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
                   .faceMatchPassed(faceRes.getFaceMatchPassed())
                   .livenessScore(faceRes.getLivenessScore())
                   .livenessPassed(faceRes.getLivenessPassed())
                   .spoofDetected(faceRes.getSpoofDetected())
                   .multipleFacesDetected(faceRes.getMultipleFacesDetected());
        }

        RiskAssessment risk = riskAssessmentRepository.findByVerificationSessionId(session.getId()).orElse(null);
        if (risk != null) {
            builder.riskScore(risk.getRiskScore())
                    .riskLevel(risk.getRiskLevel())
                    .riskReason(risk.getReason())
                    .manualReviewRequired(risk.getManualReviewRequired());
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
            } else if (art.getArtifactType() == VerificationArtifactType.SELFIE_VIDEO) {
                builder.livenessVideoUrl(art.getStorageKey());
            }
        }

        return builder.build();
    }
}
