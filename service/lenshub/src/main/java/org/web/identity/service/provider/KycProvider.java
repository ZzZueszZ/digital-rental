package org.web.identity.service.provider;

public interface KycProvider {
    String name();
    boolean supports(String providerName);
    KycVerificationResult verifyOcr(String frontImageUrl, String backImageUrl);
    KycFaceMatchResult verifyFace(String frontImageUrl, String selfieImageUrl);
    KycLivenessResult verifyLiveness(String livenessVideoUrl, String faceImageUrl);
}
