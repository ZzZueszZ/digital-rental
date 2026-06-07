package org.web.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OcrPreviewRequest {

    @NotBlank(message = "Front CCCD image is required")
    private String frontImageUrl;

    @NotBlank(message = "Back CCCD image is required")
    private String backImageUrl;
}
