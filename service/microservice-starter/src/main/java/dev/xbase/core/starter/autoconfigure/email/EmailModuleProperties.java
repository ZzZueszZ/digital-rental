package dev.xbase.core.starter.autoconfigure.email;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Objects;

@ConfigurationProperties(prefix = "app.module.email.config")
@Data
class EmailModuleProperties {
    String mailFrom = "vunt.xbase.dev@gmail.com";
    String mailFromName = "xbase.dev";
    String smtpHost = "smtp.gmail.com";
    Integer smtpPort = 587;
    String smtpUsername = "vunt.xbase.dev@gmail.com";
    String smtpPassword = "ngwa luwl jmfy fhnn";
    String smtpAuth = "true";
    String smtpStarttls = "true";
    String smtpSsl = "No";
    String smtpProtocols = "TLSv1.2";
    Boolean debug = true;
    public boolean isDebug() {
        return Objects.nonNull(debug) && debug;
    }
}
