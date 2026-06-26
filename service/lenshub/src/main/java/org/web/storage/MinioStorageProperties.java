package org.web.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.storage.minio")
public class MinioStorageProperties {
    private String internalEndpoint = "http://localhost:9000";
    private String publicEndpoint = "http://localhost:9000";
    private String accessKey = "";
    private String secretKey = "";
    private String bucket = "rental-assets";
    private int uploadExpiryMinutes = 5;
    private int downloadExpiryMinutes = 5;
}
