package org.web.common.mails.config;

import java.net.URI;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mail")
public class MailProperties {

    private String provider = "smtp";
    private String from = "no-reply@localhost";
    private String admin = "adminlenshub@gmail.com";
    private Resend resend = new Resend();

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getAdmin() {
        return admin;
    }

    public void setAdmin(String admin) {
        this.admin = admin;
    }

    public Resend getResend() {
        return resend;
    }

    public void setResend(Resend resend) {
        this.resend = resend;
    }

    public static class Resend {

        private URI baseUrl = URI.create("https://api.resend.com");
        private String apiKey;
        private Duration connectTimeout = Duration.ofSeconds(3);
        private Duration readTimeout = Duration.ofSeconds(10);
        private Duration retryDelay = Duration.ofMillis(200);
        private Duration maxRetryDelay = Duration.ofSeconds(2);
        private int maxAttempts = 2;
        private long maxAttachmentBytes = 25L * 1024 * 1024;

        public URI getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(URI baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public Duration getConnectTimeout() {
            return connectTimeout;
        }

        public void setConnectTimeout(Duration connectTimeout) {
            this.connectTimeout = connectTimeout;
        }

        public Duration getReadTimeout() {
            return readTimeout;
        }

        public void setReadTimeout(Duration readTimeout) {
            this.readTimeout = readTimeout;
        }

        public Duration getRetryDelay() {
            return retryDelay;
        }

        public void setRetryDelay(Duration retryDelay) {
            this.retryDelay = retryDelay;
        }

        public Duration getMaxRetryDelay() {
            return maxRetryDelay;
        }

        public void setMaxRetryDelay(Duration maxRetryDelay) {
            this.maxRetryDelay = maxRetryDelay;
        }

        public int getMaxAttempts() {
            return maxAttempts;
        }

        public void setMaxAttempts(int maxAttempts) {
            this.maxAttempts = maxAttempts;
        }

        public long getMaxAttachmentBytes() {
            return maxAttachmentBytes;
        }

        public void setMaxAttachmentBytes(long maxAttachmentBytes) {
            this.maxAttachmentBytes = maxAttachmentBytes;
        }
    }
}
