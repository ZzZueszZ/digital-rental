package dev.xbase.core.starter.autoconfigure.email.domain;

import lombok.Builder;
import lombok.Getter;

import java.util.Objects;

@Getter
@Builder
public class SMTPConfiguration {
    String mailFrom;
    String mailFromName;
    String smtpHost;
    Integer smtpPort;
    String smtpUsername;
    String smtpPassword;
    String smtpAuth;
    String smtpStarttls;
    String smtpSsl;
    String smtpProtocols;
    Boolean debug;

    public String type() {
        return "smtp";
    }

    public boolean isAuth() {
        return smtpAuth.equals("Yes");
    }

    public boolean isStarttls() {
        return smtpStarttls.equals("Yes");
    }

    public boolean isDebug() {
        return Objects.nonNull(debug) && debug;
    }
}
