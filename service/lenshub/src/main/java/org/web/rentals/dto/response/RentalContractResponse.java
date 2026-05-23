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
    private String customerSignature;
    private LocalDateTime signedAt;
    private boolean isLocked;
}
