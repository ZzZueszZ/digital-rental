package org.web.identity.service.provider;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class KycFaceMatchResult {
    private final double similarity;
    private final boolean matched;
    private final String rawResponse;
}
