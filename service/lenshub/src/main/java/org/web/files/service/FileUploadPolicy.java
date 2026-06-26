package org.web.files.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.web.common.exceptions.ApplicationException;
import org.web.files.model.FileAssetPurpose;

import java.util.EnumMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Component
public class FileUploadPolicy {
    private static final long MB = 1024L * 1024L;
    private final Map<FileAssetPurpose, Policy> policies = new EnumMap<>(FileAssetPurpose.class);

    public FileUploadPolicy() {
        Policy image = new Policy(5 * MB, Set.of("image/jpeg", "image/png", "image/webp", "image/avif"), "images");
        policies.put(FileAssetPurpose.PRODUCT_IMAGE, image);
        policies.put(FileAssetPurpose.REVIEW_IMAGE, image);
        policies.put(FileAssetPurpose.AVATAR, image);
        policies.put(FileAssetPurpose.KYC_ID_FRONT, image);
        policies.put(FileAssetPurpose.KYC_ID_BACK, image);
        policies.put(FileAssetPurpose.KYC_SELFIE, image);
        policies.put(FileAssetPurpose.KYC_LIVENESS_VIDEO,
                new Policy(15 * MB, Set.of("video/webm", "video/mp4", "video/quicktime"), "liveness"));
        policies.put(FileAssetPurpose.CONTRACT_PDF,
                new Policy(10 * MB, Set.of("application/pdf"), "contracts"));
    }

    public void validate(FileAssetPurpose purpose, String contentType, long sizeBytes) {
        Policy policy = requirePolicy(purpose);
        if (sizeBytes <= 0 || sizeBytes > policy.maxSizeBytes()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "File size is not allowed for this purpose");
        }
        if (!policy.contentTypes().contains(normalizeContentType(contentType))) {
            throw new ApplicationException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "File type is not allowed for this purpose");
        }
    }

    public void validateFileName(String fileName, String contentType) {
        int dot = fileName == null ? -1 : fileName.lastIndexOf('.');
        if (dot < 1 || dot == fileName.length() - 1) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "File name must include a valid extension");
        }
        String extension = fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
        if (!extensionsFor(contentType).contains(extension)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "File extension does not match content type");
        }
    }

    public String prefix(FileAssetPurpose purpose, Long ownerId) {
        String owner = String.valueOf(ownerId);
        return switch (purpose) {
            case PRODUCT_IMAGE -> "products/pending/" + owner + "/images";
            case REVIEW_IMAGE -> "reviews/pending/" + owner + "/images";
            case AVATAR -> "avatars/" + owner;
            case KYC_ID_FRONT, KYC_ID_BACK, KYC_SELFIE -> "kyc/" + owner + "/identity";
            case KYC_LIVENESS_VIDEO -> "kyc/" + owner + "/liveness";
            case CONTRACT_PDF -> "contracts/pending/" + owner;
        };
    }

    public String normalizeContentType(String contentType) {
        return contentType == null ? "" : contentType.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
    }

    private Policy requirePolicy(FileAssetPurpose purpose) {
        Policy policy = policies.get(purpose);
        if (policy == null) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Unsupported file purpose");
        }
        return policy;
    }

    private Set<String> extensionsFor(String contentType) {
        return switch (normalizeContentType(contentType)) {
            case "image/jpeg" -> Set.of("jpg", "jpeg");
            case "image/png" -> Set.of("png");
            case "image/webp" -> Set.of("webp");
            case "image/avif" -> Set.of("avif");
            case "video/webm" -> Set.of("webm");
            case "video/mp4" -> Set.of("mp4");
            case "video/quicktime" -> Set.of("mov");
            case "application/pdf" -> Set.of("pdf");
            default -> Set.of();
        };
    }

    private record Policy(long maxSizeBytes, Set<String> contentTypes, String category) {
    }
}
