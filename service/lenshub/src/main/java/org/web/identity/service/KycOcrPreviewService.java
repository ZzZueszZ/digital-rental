package org.web.identity.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.common.enums.VerificationArtifactStatus;
import org.web.common.enums.VerificationArtifactType;
import org.web.common.enums.VerificationSessionStatus;
import org.web.common.enums.VerificationType;
import org.web.identity.dto.request.OcrPreviewRequest;
import org.web.identity.dto.response.KycOcrPreviewResponse;
import org.web.identity.model.VerificationArtifact;
import org.web.identity.model.VerificationResult;
import org.web.identity.model.VerificationSession;
import org.web.identity.repository.VerificationArtifactRepository;
import org.web.identity.repository.VerificationResultRepository;
import org.web.identity.repository.VerificationSessionRepository;
import org.web.identity.service.provider.KycOcrResult;
import org.web.identity.service.provider.KycProvider;
import org.web.identity.service.provider.KycVerificationResult;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycOcrPreviewService {

    private static final double LOW_CONFIDENCE_THRESHOLD = 0.70;
    private static final double REVIEW_CONFIDENCE_THRESHOLD = 0.90;

    private final KycProviderRegistry providerRegistry;
    private final VerificationSessionRepository verificationSessionRepository;
    private final VerificationArtifactRepository artifactRepository;
    private final VerificationResultRepository verificationResultRepository;
    private final UserRepository userRepository;

    @Transactional
    public KycOcrPreviewResponse preview(User user, OcrPreviewRequest request) {
        User lockedUser = userRepository.findByIdForUpdate(user.getId())
                .orElseThrow(() -> new IllegalStateException("KYC user no longer exists"));
        VerificationSession session = findOrCreateDraftSession(lockedUser);

        KycOcrPreviewResponse cached = findCachedPreview(session, request);
        if (cached != null) {
            return cached;
        }

        saveArtifact(session, VerificationArtifactType.CCCD_FRONT, request.getFrontImageUrl());
        saveArtifact(session, VerificationArtifactType.CCCD_BACK, request.getBackImageUrl());

        KycProvider provider = providerRegistry.activeProvider();
        log.info("KYC OCR preview started: userId={}, sessionId={}, provider={}",
                user.getId(), session.getId(), provider.name());
        KycVerificationResult providerResult = provider.verifyOcr(request.getFrontImageUrl(), request.getBackImageUrl());
        KycOcrResult ocr = mergeOcr(providerResult.getFrontOcr(), providerResult.getBackOcr());
        List<String> warnings = validate(ocr);

        VerificationResult result = verificationResultRepository.findByVerificationSessionId(session.getId())
                .orElseGet(() -> VerificationResult.builder().verificationSession(session).build());
        result.setOcrProvider(providerResult.getProvider());
        result.setOcrConfidence(ocr.getConfidence());
        result.setDecisionSource(null);
        result.setDocumentValid(warnings.isEmpty());
        result.setDocumentTampered(false);
        result.setFieldsMatchProfile(warnings.isEmpty());
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

        log.info("KYC OCR preview completed: userId={}, sessionId={}, confidence={}, warnings={}",
                user.getId(), session.getId(), ocr.getConfidence(), warnings.size());
        return toResponse(session, request, ocr, warnings);
    }

    private KycOcrPreviewResponse findCachedPreview(
            VerificationSession session,
            OcrPreviewRequest request
    ) {
        boolean frontMatches = artifactRepository
                .findByVerificationSessionIdAndArtifactType(session.getId(), VerificationArtifactType.CCCD_FRONT)
                .map(artifact -> Objects.equals(artifact.getStorageKey(), request.getFrontImageUrl()))
                .orElse(false);
        boolean backMatches = artifactRepository
                .findByVerificationSessionIdAndArtifactType(session.getId(), VerificationArtifactType.CCCD_BACK)
                .map(artifact -> Objects.equals(artifact.getStorageKey(), request.getBackImageUrl()))
                .orElse(false);
        if (!frontMatches || !backMatches) {
            return null;
        }

        VerificationResult result = verificationResultRepository
                .findByVerificationSessionId(session.getId())
                .filter(saved -> saved.getOcrConfidence() != null && saved.getRawOcrJson() != null)
                .orElse(null);
        if (result == null) {
            return null;
        }

        KycOcrResult ocr = fromVerificationResult(result);
        List<String> warnings = validate(ocr);
        log.info("KYC OCR preview reused: sessionId={}, confidence={}, warnings={}",
                session.getId(), ocr.getConfidence(), warnings.size());
        return toResponse(session, request, ocr, warnings);
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
                .successful(true)
                .rawResponse(result.getRawOcrJson())
                .build();
    }

    private VerificationSession findOrCreateDraftSession(User user) {
        return verificationSessionRepository.findByUserId(user.getId()).stream()
                .filter(session -> session.getStatus() == VerificationSessionStatus.CREATED)
                .findFirst()
                .orElseGet(() -> verificationSessionRepository.save(VerificationSession.builder()
                        .user(user)
                        .status(VerificationSessionStatus.CREATED)
                        .verificationType(VerificationType.KYC_CCCD_SELFIE)
                        .startedAt(LocalDateTime.now())
                        .build()));
    }

    private KycOcrResult mergeOcr(KycOcrResult front, KycOcrResult back) {
        return KycOcrResult.builder()
                .identityNumber(first(front.getIdentityNumber(), back.getIdentityNumber()))
                .fullName(first(front.getFullName(), back.getFullName()))
                .dateOfBirth(first(front.getDateOfBirth(), back.getDateOfBirth()))
                .gender(first(front.getGender(), back.getGender()))
                .nationality(first(front.getNationality(), back.getNationality()))
                .placeOfOrigin(first(front.getPlaceOfOrigin(), back.getPlaceOfOrigin()))
                .placeOfResidence(first(front.getPlaceOfResidence(), back.getPlaceOfResidence()))
                .issuedDate(first(front.getIssuedDate(), back.getIssuedDate()))
                .expiryDate(first(front.getExpiryDate(), back.getExpiryDate()))
                .confidence((front.getConfidence() + back.getConfidence()) / 2)
                .documentType(first(front.getDocumentType(), back.getDocumentType()))
                .successful(front.isSuccessful() && back.isSuccessful())
                .rawResponse("{\"front\":" + nullSafe(front.getRawResponse()) + ",\"back\":" + nullSafe(back.getRawResponse()) + "}")
                .build();
    }

    private List<String> validate(KycOcrResult ocr) {
        List<String> warnings = new ArrayList<>();
        if (!ocr.isSuccessful()) {
            warnings.add("OCR provider returned unsuccessful result");
        }
        require(warnings, ocr.getIdentityNumber(), "Missing identity number");
        require(warnings, ocr.getFullName(), "Missing full name");
        if (ocr.getDateOfBirth() == null) {
            warnings.add("Missing date of birth");
        }
        require(warnings, ocr.getPlaceOfResidence(), "Missing place of residence");
        if (ocr.getExpiryDate() != null && ocr.getExpiryDate().isBefore(LocalDate.now())) {
            warnings.add("CCCD is expired");
        }
        if (ocr.getConfidence() < LOW_CONFIDENCE_THRESHOLD) {
            warnings.add("OCR confidence is too low");
        } else if (ocr.getConfidence() < REVIEW_CONFIDENCE_THRESHOLD) {
            warnings.add("OCR confidence needs manual review");
        }
        return warnings;
    }

    private void require(List<String> warnings, String value, String message) {
        if (value == null || value.isBlank()) {
            warnings.add(message);
        }
    }

    private KycOcrPreviewResponse toResponse(
            VerificationSession session,
            OcrPreviewRequest request,
            KycOcrResult ocr,
            List<String> warnings
    ) {
        return KycOcrPreviewResponse.builder()
                .sessionId(session.getId())
                .frontImageUrl(request.getFrontImageUrl())
                .backImageUrl(request.getBackImageUrl())
                .identityNumber(ocr.getIdentityNumber())
                .fullName(ocr.getFullName())
                .dateOfBirth(ocr.getDateOfBirth())
                .gender(ocr.getGender())
                .nationality(ocr.getNationality())
                .placeOfOrigin(ocr.getPlaceOfOrigin())
                .placeOfResidence(ocr.getPlaceOfResidence())
                .issuedDate(ocr.getIssuedDate())
                .expiryDate(ocr.getExpiryDate())
                .ocrConfidence(ocr.getConfidence())
                .documentType(ocr.getDocumentType())
                .successful(ocr.isSuccessful())
                .previewStatus(warnings.isEmpty() ? "READY" : "NEEDS_REVIEW")
                .warnings(warnings)
                .build();
    }

    private void saveArtifact(VerificationSession session, VerificationArtifactType type, String url) {
        VerificationArtifact artifact = artifactRepository.findByVerificationSessionIdAndArtifactType(session.getId(), type)
                .orElseGet(() -> VerificationArtifact.builder()
                        .verificationSession(session)
                        .artifactType(type)
                        .build());
        artifact.setArtifactStatus(VerificationArtifactStatus.UPLOADED);
        artifact.setStorageKey(url);
        artifact.setOriginalFileName(fileName(url));
        artifact.setMimeType("image/jpeg");
        artifact.setFileSize(1024L);
        artifactRepository.save(artifact);
    }

    private String fileName(String url) {
        if (url == null || url.isBlank()) return "unknown.jpg";
        int index = url.lastIndexOf('/');
        return index >= 0 ? url.substring(index + 1) : url;
    }

    private <T> T first(T first, T second) {
        return first != null ? first : second;
    }

    private String nullSafe(String raw) {
        return raw == null ? "{}" : raw;
    }
}
