package org.web.files.dto.response;

import java.time.LocalDateTime;

public record PresignedDownloadResponse(String downloadUrl, LocalDateTime expiresAt) {
}
