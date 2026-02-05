package dev.xbase.core.starter.autoconfigure;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    String version = "v0.0.1";
    String instanceId = UUID.randomUUID().toString();
}
