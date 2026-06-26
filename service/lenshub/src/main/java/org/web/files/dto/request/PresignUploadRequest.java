package org.web.files.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.web.files.model.FileAssetPurpose;

public record PresignUploadRequest(
        @NotNull FileAssetPurpose purpose,
        @NotBlank String fileName,
        @NotBlank String contentType,
        @Positive long sizeBytes
) {
}
