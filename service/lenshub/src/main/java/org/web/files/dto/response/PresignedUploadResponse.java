package org.web.files.dto.response;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record PresignedUploadResponse(
        UUID assetId,
        String uploadUrl,
        Map<String, String> requiredHeaders,
        LocalDateTime expiresAt
) {
}
