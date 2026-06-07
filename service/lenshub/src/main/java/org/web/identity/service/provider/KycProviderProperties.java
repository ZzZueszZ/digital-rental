package org.web.identity.service.provider;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.kyc")
public class KycProviderProperties {
    private String provider = "mock";
    private int timeoutMs = 10000;
    private Fpt fpt = new Fpt();

    @Getter
    @Setter
    public static class Fpt {
        private String apiKey = "";
        private String idrUrl = "https://api.fpt.ai/vision/idr/vnm/";
        private String facematchUrl = "https://api.fpt.ai/dmp/checkface/v1";
        private String livenessUrl = "https://api.fpt.ai/dmp/liveness/v3";
    }
}
