package org.web.rentals.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalContractResponse {
    private Long id;
    private String contractNumber;
    private String termsAndConditions;
    private int contractVersion;
    private String contractHash;
    private String documentHash;
    private Long signerUserId;
    private String signerIp;
    private String signerUserAgent;
    private org.web.common.enums.ContractStatus status;
    private LocalDateTime signedAt;
    private String lessorSignature;
    private LocalDateTime lessorSignedAt;
    private LocalDateTime generatedAt;

    @JsonProperty("isLocked")
    private boolean isLocked;
}
