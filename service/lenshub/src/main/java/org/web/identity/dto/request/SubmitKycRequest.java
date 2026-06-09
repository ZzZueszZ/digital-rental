package org.web.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitKycRequest {

    @NotBlank(message = "Front document image URL is required")
    private String frontImageUrl;

    @NotBlank(message = "Back document image URL is required")
    private String backImageUrl;

    @NotBlank(message = "Selfie image URL is required")
    private String selfieImageUrl;

    @NotBlank(message = "Liveness video URL is required")
    private String livenessVideoUrl;
}
