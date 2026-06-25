package org.web.identity.service.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FptKycProviderTest {

    private final FptKycProvider provider = new FptKycProvider(
            new KycProviderProperties(),
            null,
            new ObjectMapper()
    );

    @Test
    void parseFaceMatchResponseSupportsDirectFptPayload() throws Exception {
        String raw = """
                {
                  "code": "303",
                  "message": "face is not matching with document",
                  "face_match": {
                    "code": "303",
                    "message": "face is not matching with document",
                    "isMatch": "false",
                    "similarity": "4.7",
                    "warning": "N/A"
                  }
                }
                """;

        KycFaceMatchResult result = provider.parseFaceMatchResponse(raw);

        assertThat(result.getSimilarity()).isEqualTo(4.7);
        assertThat(result.isMatched()).isFalse();
        assertThat(result.getRawResponse()).isEqualTo(raw);
    }

    @Test
    void parseLivenessResponseSupportsDirectFptPayload() throws Exception {
        String raw = """
                {
                  "code": "303",
                  "message": "face is not matching with document",
                  "liveness": {
                    "code": "200",
                    "message": "liveness check successful",
                    "is_live": "true",
                    "spoof_prob": "0.3698",
                    "need_to_review": "false",
                    "is_deepfake": "N/A",
                    "deepfake_prob": "N/A",
                    "warning": ""
                  },
                  "face_match": {
                    "code": "303",
                    "message": "face is not matching with document",
                    "isMatch": "false",
                    "similarity": "4.7",
                    "warning": "N/A"
                  }
                }
                """;

        KycLivenessResult result = provider.parseLivenessResponse(raw);

        assertThat(result.isPassed()).isTrue();
        assertThat(result.getScore()).isEqualTo(1);
        assertThat(result.isSpoofDetected()).isFalse();
        assertThat(result.isMultipleFacesDetected()).isFalse();
        assertThat(result.getRawResponse()).isEqualTo(raw);
    }
}
