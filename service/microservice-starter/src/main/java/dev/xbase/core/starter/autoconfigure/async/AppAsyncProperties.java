package dev.xbase.core.starter.autoconfigure.async;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.async")
@Data
class AppAsyncProperties {
    Integer poolSize = 50;
    Integer maxPoolSize = 100;
    Integer queueCapacity = 1000;
    String threadNamePrefix = "CustomAsync-";
}
