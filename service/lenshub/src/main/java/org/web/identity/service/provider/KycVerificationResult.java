package org.web.identity.service.provider;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class KycVerificationResult {
    private final String provider;
    private final KycOcrResult frontOcr;
    private final KycOcrResult backOcr;
    private final KycFaceMatchResult faceMatch;
}
