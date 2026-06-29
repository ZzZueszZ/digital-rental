package org.web.common.mails.gateway;

import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.web.common.mails.config.MailProperties;

@Component
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "resend")
public class ResendMailGateway implements MailGateway {

    private static final String PROVIDER = "resend";
    private static final String IDEMPOTENCY_HEADER = "Idempotency-Key";

    private final MailProperties.Resend properties;
    private final RestClient restClient;
    private final Sleeper sleeper;
    private final ResendPayloadFactory payloadFactory;

    @Autowired
    public ResendMailGateway(MailProperties mailProperties) {
        this(
                mailProperties.getResend(),
                createRestClient(mailProperties.getResend()),
                duration -> Thread.sleep(duration.toMillis()),
                new ResendPayloadFactory(mailProperties.getResend().getMaxAttachmentBytes())
        );
    }

    ResendMailGateway(
            MailProperties.Resend properties,
            RestClient restClient,
            Sleeper sleeper,
            ResendPayloadFactory payloadFactory
    ) {
        validate(properties);
        this.properties = properties;
        this.restClient = restClient;
        this.sleeper = sleeper;
        this.payloadFactory = payloadFactory;
    }

    @Override
    public MailDeliveryResult send(MailMessage message) {
        Map<String, Object> payload = payloadFactory.create(message);
        int maxAttempts = properties.getMaxAttempts();
        boolean retryEnabled = message.idempotencyKey() != null
                && !message.idempotencyKey().isBlank();

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                ResendResponse response = restClient.post()
                        .uri("/emails")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getApiKey())
                        .headers(headers -> addIdempotencyKey(headers, message.idempotencyKey()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .body(ResendResponse.class);

                if (response == null || response.id() == null || response.id().isBlank()) {
                    throw deliveryException(false, "Resend returned no message ID");
                }
                return new MailDeliveryResult(PROVIDER, response.id());
            } catch (RestClientResponseException exception) {
                boolean transientFailure = isTransient(exception.getStatusCode().value());
                if (transientFailure && retryEnabled && attempt < maxAttempts) {
                    pause(retryDelay(exception));
                    continue;
                }
                throw deliveryException(
                        transientFailure,
                        "Resend returned HTTP " + exception.getStatusCode().value()
                );
            } catch (ResourceAccessException exception) {
                if (retryEnabled && attempt < maxAttempts) {
                    pause(properties.getRetryDelay());
                    continue;
                }
                throw deliveryException(true, "Resend request timed out or was unavailable");
            } catch (MailDeliveryException exception) {
                throw exception;
            } catch (RestClientException exception) {
                throw deliveryException(false, "Resend request could not be completed");
            }
        }
        throw deliveryException(true, "Resend request exhausted retry attempts");
    }

    private void addIdempotencyKey(HttpHeaders headers, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            headers.set(IDEMPOTENCY_HEADER, idempotencyKey);
        }
    }

    private Duration retryDelay(RestClientResponseException exception) {
        String retryAfter = exception.getResponseHeaders() == null
                ? null
                : exception.getResponseHeaders().getFirst(HttpHeaders.RETRY_AFTER);
        if (retryAfter == null) {
            return properties.getRetryDelay();
        }
        try {
            Duration requested = Duration.ofSeconds(Long.parseLong(retryAfter.trim()));
            if (requested.isNegative()) {
                return properties.getRetryDelay();
            }
            return requested.compareTo(properties.getMaxRetryDelay()) > 0
                    ? properties.getMaxRetryDelay()
                    : requested;
        } catch (NumberFormatException ignored) {
            return properties.getRetryDelay();
        }
    }

    private void pause(Duration duration) {
        try {
            sleeper.sleep(duration);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw deliveryException(true, "Resend retry was interrupted");
        }
    }

    private static boolean isTransient(int status) {
        return status == 429 || status >= 500;
    }

    private static void validate(MailProperties.Resend properties) {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            throw new IllegalStateException("RESEND_API_KEY is required when Resend is enabled");
        }
        if (properties.getBaseUrl() == null
                || !"https".equalsIgnoreCase(properties.getBaseUrl().getScheme())) {
            throw new IllegalStateException("Resend base URL must use HTTPS");
        }
        if (!isPositive(properties.getConnectTimeout())
                || !isPositive(properties.getReadTimeout())) {
            throw new IllegalStateException("Resend connect/read timeouts must be positive");
        }
        if (properties.getRetryDelay() == null
                || properties.getRetryDelay().isNegative()
                || properties.getMaxRetryDelay() == null
                || properties.getMaxRetryDelay().isNegative()
                || properties.getRetryDelay().compareTo(properties.getMaxRetryDelay()) > 0) {
            throw new IllegalStateException("Resend retry delays must be bounded and non-negative");
        }
        if (properties.getMaxAttempts() < 1 || properties.getMaxAttempts() > 2) {
            throw new IllegalStateException("Resend max attempts must be 1 or 2");
        }
        if (properties.getMaxAttachmentBytes() <= 0) {
            throw new IllegalStateException("Resend attachment limit must be positive");
        }
    }

    private static boolean isPositive(Duration duration) {
        return duration != null && !duration.isNegative() && !duration.isZero();
    }

    private static RestClient createRestClient(MailProperties.Resend properties) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.getConnectTimeout());
        requestFactory.setReadTimeout(properties.getReadTimeout());
        return RestClient.builder()
                .baseUrl(properties.getBaseUrl().toString())
                .requestFactory(requestFactory)
                .build();
    }

    private static MailDeliveryException deliveryException(
            boolean transientFailure,
            String reason
    ) {
        return new MailDeliveryException(
                PROVIDER,
                transientFailure,
                new IllegalStateException(reason)
        );
    }

    public record ResendResponse(String id) {
    }

    @FunctionalInterface
    interface Sleeper {
        void sleep(Duration duration) throws InterruptedException;
    }
}
