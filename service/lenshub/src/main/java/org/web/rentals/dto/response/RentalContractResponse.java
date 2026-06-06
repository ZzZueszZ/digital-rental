package org.web.rentals.dto.response;

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
    private Long signerUserId;
    private String signerIp;
    private org.web.common.enums.ContractStatus status;
    private LocalDateTime signedAt;
    private boolean isLocked;
}
