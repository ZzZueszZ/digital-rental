package org.web.identity.service.provider;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class KycLivenessResult {
    private final double score;
    private final boolean passed;
    private final boolean spoofDetected;
    private final boolean multipleFacesDetected;
    private final String rawResponse;
}
