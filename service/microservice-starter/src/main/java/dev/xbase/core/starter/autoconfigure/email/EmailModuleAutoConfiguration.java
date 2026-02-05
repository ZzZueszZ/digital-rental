package dev.xbase.core.starter.autoconfigure.email;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(value = "app.module.email.enabled", havingValue = "true")
//@ConditionalOnClass(name = "")
@EnableConfigurationProperties(EmailModuleProperties.class)
public class EmailModuleAutoConfiguration {
}
