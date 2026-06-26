package org.web.files.dto.response;

import org.web.files.model.FileAssetPurpose;
import org.web.files.model.FileAssetStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record FileAssetResponse(
        UUID id,
        FileAssetPurpose purpose,
        String contentType,
        long sizeBytes,
        FileAssetStatus status,
        LocalDateTime createdAt
) {
}
