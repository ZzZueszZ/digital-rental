package org.web.rentals.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignContractRequest {
    private String signature;
    private String otpCode;
}
