package org.web.identity.service;

import lombok.Builder;
import lombok.Getter;
import org.web.common.enums.RiskLevel;

@Getter
@Builder
public class KycRiskAssessmentResult {
    private final double riskScore;
    private final RiskLevel riskLevel;
    private final boolean manualReviewRequired;
    private final boolean documentValid;
    private final String reason;
}
