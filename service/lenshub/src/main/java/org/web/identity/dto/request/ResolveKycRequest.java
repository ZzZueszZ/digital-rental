package org.web.identity.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResolveKycRequest {

    @NotNull(message = "Approval status is required")
    private Boolean approved;

    private String note;
}
