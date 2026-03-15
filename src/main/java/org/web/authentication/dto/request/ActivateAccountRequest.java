package org.web.authentication.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ActivateAccountRequest {
    @NotBlank(message = "Activation token is required")
    private String token;
}
