package org.web.common.mails.gateway;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.web.common.mails.config.MailProperties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class ResendMailGatewayTest {

    private MailProperties.Resend properties;
    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        properties = new MailProperties.Resend();
        properties.setApiKey("re_test_key");
        restClientBuilder = RestClient.builder().baseUrl("https://api.resend.test");
        server = MockRestServiceServer.bindTo(restClientBuilder).build();
    }

    @Test
    void sendsMappedPayloadAndReturnsProviderMessageId() {
        server.expect(once(), requestTo("https://api.resend.test/emails"))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer re_test_key"))
                .andExpect(header("Idempotency-Key", "activation-user-1"))
                .andExpect(content().json("""
                        {
                          "from":"LensHub <mail@lenshub.shop>",
                          "to":["customer@example.com"],
                          "subject":"Subject unchanged",
                          "html":"<strong>Body unchanged</strong>",
                          "text":"Body unchanged"
                        }
                        """))
                .andRespond(withSuccess(
                        "{\"id\":\"email_123\"}",
                        MediaType.APPLICATION_JSON
                ));

        MailDeliveryResult result = gateway(duration -> {
        }).send(message(List.of(), "activation-user-1"));

        assertEquals("resend", result.provider());
        assertEquals("email_123", result.messageId());
        server.verify();
    }

    @Test
    void retries429OnceAndCapsRetryAfter() {
        AtomicReference<Duration> delay = new AtomicReference<>();
        server.expect(requestTo("https://api.resend.test/emails"))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS)
                        .header(HttpHeaders.RETRY_AFTER, "30"));
        server.expect(requestTo("https://api.resend.test/emails"))
                .andRespond(withSuccess(
                        "{\"id\":\"email_retry\"}",
                        MediaType.APPLICATION_JSON
                ));

        MailDeliveryResult result = gateway(delay::set).send(message(List.of(), "retry-key"));

        assertEquals("email_retry", result.messageId());
        assertEquals(Duration.ofSeconds(2), delay.get());
        server.verify();
    }

    @Test
    void retriesServerErrorOnlyOnce() {
        server.expect(requestTo("https://api.resend.test/emails"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));
        server.expect(requestTo("https://api.resend.test/emails"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        MailDeliveryException exception = assertThrows(
                MailDeliveryException.class,
                () -> gateway(duration -> {
                }).send(message(List.of(), "server-error-key"))
        );

        assertTrue(exception.isTransientFailure());
        server.verify();
    }

    @Test
    void permanentClientErrorFailsWithoutRetry() {
        server.expect(once(), requestTo("https://api.resend.test/emails"))
                .andRespond(withStatus(HttpStatus.UNPROCESSABLE_ENTITY)
                        .body("{\"message\":\"invalid recipient\"}")
                        .contentType(MediaType.APPLICATION_JSON));

        MailDeliveryException exception = assertThrows(
                MailDeliveryException.class,
                () -> gateway(duration -> {
                }).send(message(List.of(), null))
        );

        assertFalse(exception.isTransientFailure());
        assertFalse(exception.getCause().getMessage().contains("invalid recipient"));
        server.verify();
    }

    @Test
    void transientFailureWithoutIdempotencyKeyIsNotRetried() {
        server.expect(once(), requestTo("https://api.resend.test/emails"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        MailDeliveryException exception = assertThrows(
                MailDeliveryException.class,
                () -> gateway(duration -> {
                }).send(message(List.of(), null))
        );

        assertTrue(exception.isTransientFailure());
        server.verify();
    }

    private ResendMailGateway gateway(ResendMailGateway.Sleeper sleeper) {
        return new ResendMailGateway(
                properties,
                restClientBuilder.build(),
                sleeper,
                new ResendPayloadFactory(properties.getMaxAttachmentBytes())
        );
    }

    private MailMessage message(List<MailAttachment> attachments, String idempotencyKey) {
        return new MailMessage(
                "LensHub <mail@lenshub.shop>",
                "customer@example.com",
                "Subject unchanged",
                "<strong>Body unchanged</strong>",
                "Body unchanged",
                attachments,
                MailCategory.ACTIVATION,
                idempotencyKey
        );
    }
}
