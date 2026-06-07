package org.web.identity.service.provider;

import org.springframework.stereotype.Component;
import org.web.identity.dto.request.SubmitKycRequest;

import java.time.LocalDate;

@Component
public class MockKycProvider implements KycProvider {

    @Override
    public String name() {
        return "mock";
    }

    @Override
    public boolean supports(String providerName) {
        return providerName == null || providerName.isBlank() || name().equalsIgnoreCase(providerName);
    }

    @Override
    public KycVerificationResult verify(SubmitKycRequest request) {
        KycVerificationResult ocr = verifyOcr(request.getFrontImageUrl(), request.getBackImageUrl());
        KycFaceMatchResult face = verifyFace(request.getFrontImageUrl(), request.getSelfieImageUrl());
        return KycVerificationResult.builder()
                .provider(name())
                .frontOcr(ocr.getFrontOcr())
                .backOcr(ocr.getBackOcr())
                .faceMatch(face)
                .build();
    }

    @Override
    public KycVerificationResult verifyOcr(String frontImageUrl, String backImageUrl) {
        boolean fail = containsFail(frontImageUrl) || containsFail(backImageUrl);
        KycOcrResult front = KycOcrResult.builder()
                .identityNumber(fail ? "999000000001" : "012345678901")
                .fullName(fail ? "" : "Nguyen Van A")
                .dateOfBirth(LocalDate.of(1998, 1, 15))
                .gender("MALE")
                .nationality("Viet Nam")
                .placeOfOrigin("Ha Noi")
                .placeOfResidence("Ho Chi Minh")
                .expiryDate(LocalDate.now().plusYears(5))
                .confidence(fail ? 0.55 : 0.96)
                .documentType("cccd_12_front")
                .successful(!fail)
                .rawResponse("{\"provider\":\"mock\",\"side\":\"front\"}")
                .build();
        KycOcrResult back = KycOcrResult.builder()
                .issuedDate(LocalDate.of(2022, 6, 1))
                .confidence(fail ? 0.60 : 0.94)
                .documentType("new_back")
                .successful(!fail)
                .rawResponse("{\"provider\":\"mock\",\"side\":\"back\"}")
                .build();
        return KycVerificationResult.builder()
                .provider(name())
                .frontOcr(front)
                .backOcr(back)
                .build();
    }

    @Override
    public KycFaceMatchResult verifyFace(String frontImageUrl, String selfieImageUrl) {
        boolean fail = containsFail(frontImageUrl) || containsFail(selfieImageUrl);
        return KycFaceMatchResult.builder()
                .similarity(fail ? 52.0 : 94.0)
                .matched(!fail)
                .rawResponse("{\"provider\":\"mock\",\"faceMatch\":" + !fail + "}")
                .build();
    }

    @Override
    public KycLivenessResult verifyLiveness(String livenessVideoUrl, String faceImageUrl) {
        boolean fail = containsFail(livenessVideoUrl) || containsFail(faceImageUrl);
        return KycLivenessResult.builder()
                .score(fail ? 0.42 : 0.93)
                .passed(!fail)
                .spoofDetected(fail)
                .multipleFacesDetected(false)
                .rawResponse("{\"provider\":\"mock\",\"liveness\":" + !fail + "}")
                .build();
    }

    private boolean containsFail(String value) {
        return value != null && value.toLowerCase().contains("fail");
    }
}
