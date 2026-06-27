package org.web.files.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.common.exceptions.ApplicationException;
import org.web.files.dto.request.PresignUploadRequest;
import org.web.files.dto.response.FileAssetResponse;
import org.web.files.dto.response.PresignedDownloadResponse;
import org.web.files.dto.response.PresignedUploadResponse;
import org.web.files.model.FileAsset;
import org.web.files.model.FileAssetStatus;
import org.web.files.repository.FileAssetRepository;
import org.web.files.service.FileAssetService;
import org.web.files.service.FileUploadPolicy;
import org.web.storage.MinioStorageProperties;
import org.web.storage.StorageObjectMetadata;
import org.web.storage.StorageService;
import org.web.users.model.User;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileAssetServiceImpl implements FileAssetService {
    private final FileAssetRepository repository;
    private final StorageService storageService;
    private final MinioStorageProperties properties;
    private final FileUploadPolicy policy;

    @Override
    @Transactional
    public PresignedUploadResponse createUpload(User user, PresignUploadRequest request) {
        String contentType = policy.normalizeContentType(request.contentType());
        policy.validate(request.purpose(), contentType, request.sizeBytes());
        policy.validateFileName(request.fileName(), contentType);

        UUID assetId = UUID.randomUUID();
        String objectKey = policy.prefix(request.purpose(), user.getId()) + "/" + assetId + extension(request.fileName(), contentType);
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(properties.getUploadExpiryMinutes());
        FileAsset asset = FileAsset.builder()
                .id(assetId)
                .owner(user)
                .purpose(request.purpose())
                .bucket(properties.getBucket())
                .objectKey(objectKey)
                .originalFilename(safeFileName(request.fileName()))
                .contentType(contentType)
                .sizeBytes(request.sizeBytes())
                .status(FileAssetStatus.PENDING)
                .uploadExpiresAt(expiresAt)
                .build();
        repository.save(asset);

        String uploadUrl = storageService.presignPut(objectKey, contentType,
                Duration.ofMinutes(properties.getUploadExpiryMinutes()));
        return new PresignedUploadResponse(assetId, uploadUrl, Map.of("Content-Type", contentType), expiresAt);
    }

    @Override
    @Transactional
    public FileAssetResponse complete(User user, UUID assetId, boolean canManageAll) {
        FileAsset asset = findForActor(user, assetId, canManageAll);
        if (asset.getStatus() == FileAssetStatus.READY) {
            return response(asset);
        }
        if (asset.getStatus() != FileAssetStatus.PENDING || asset.getUploadExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApplicationException(HttpStatus.CONFLICT, "Upload is no longer pending");
        }

        StorageObjectMetadata metadata = storageService.stat(asset.getObjectKey());
        if (metadata.sizeBytes() != asset.getSizeBytes()
                || !asset.getContentType().equals(policy.normalizeContentType(metadata.contentType()))) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Uploaded file metadata does not match the requested file");
        }
        asset.setEtag(metadata.etag());
        asset.setStatus(FileAssetStatus.READY);
        return response(repository.save(asset));
    }

    @Override
    @Transactional
    public FileAssetResponse uploadContent(User user, UUID assetId, String contentType, byte[] content, boolean canManageAll) {
        FileAsset asset = findForActor(user, assetId, canManageAll);
        if (asset.getStatus() == FileAssetStatus.READY) {
            return response(asset);
        }
        if (asset.getStatus() != FileAssetStatus.PENDING || asset.getUploadExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApplicationException(HttpStatus.CONFLICT, "Upload is no longer pending");
        }
        String normalizedContentType = policy.normalizeContentType(contentType);
        if (!asset.getContentType().equals(normalizedContentType)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Uploaded file content type does not match the requested file");
        }
        if (content == null || content.length != asset.getSizeBytes()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Uploaded file size does not match the requested file");
        }

        storageService.putBytes(asset.getObjectKey(), content, normalizedContentType);
        asset.setEtag("backend-upload-" + assetId);
        asset.setStatus(FileAssetStatus.READY);
        return response(repository.save(asset));
    }

    @Override
    @Transactional(readOnly = true)
    public PresignedDownloadResponse createDownload(User user, UUID assetId, boolean canManageAll) {
        FileAsset asset = findForActor(user, assetId, canManageAll);
        if (asset.getStatus() != FileAssetStatus.READY) {
            throw new ApplicationException(HttpStatus.CONFLICT, "File is not ready");
        }
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(properties.getDownloadExpiryMinutes());
        String downloadUrl = storageService.presignGet(asset.getObjectKey(),
                Duration.ofMinutes(properties.getDownloadExpiryMinutes()));
        return new PresignedDownloadResponse(downloadUrl, expiresAt);
    }

    @Override
    @Transactional
    public void delete(User user, UUID assetId, boolean canManageAll) {
        FileAsset asset = findForActor(user, assetId, canManageAll);
        if (asset.getStatus() == FileAssetStatus.DELETED) {
            return;
        }
        storageService.delete(asset.getObjectKey());
        asset.setStatus(FileAssetStatus.DELETED);
        asset.setDeletedAt(LocalDateTime.now());
        repository.save(asset);
    }

    private FileAsset findForActor(User user, UUID assetId, boolean canManageAll) {
        FileAsset asset = repository.findById(assetId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "File asset not found"));
        if (!canManageAll && !asset.getOwner().getId().equals(user.getId())) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "You cannot access this file asset");
        }
        return asset;
    }

    private FileAssetResponse response(FileAsset asset) {
        return new FileAssetResponse(asset.getId(), asset.getPurpose(), asset.getContentType(),
                asset.getSizeBytes(), asset.getStatus(), asset.getCreatedAt());
    }

    private String safeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String extension(String fileName, String contentType) {
        String normalized = fileName == null ? "" : fileName.trim();
        int dot = normalized.lastIndexOf('.');
        if (dot > -1 && dot < normalized.length() - 1) {
            return "." + normalized.substring(dot + 1).replaceAll("[^a-zA-Z0-9]", "").toLowerCase(Locale.ROOT);
        }
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/avif" -> ".avif";
            case "video/webm" -> ".webm";
            case "video/mp4" -> ".mp4";
            case "video/quicktime" -> ".mov";
            case "application/pdf" -> ".pdf";
            default -> ".bin";
        };
    }
}
