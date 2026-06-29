package org.web.common.mails.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.mail.javamail.JavaMailSender;
import org.web.common.mails.gateway.MailGateway;
import org.web.common.mails.gateway.ResendMailGateway;
import org.web.common.mails.gateway.SmtpMailGateway;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class MailGatewayConfigurationTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(
                    MailGatewayConfiguration.class,
                    SmtpMailGateway.class,
                    ResendMailGateway.class
            )
            .withBean(JavaMailSender.class, () -> mock(JavaMailSender.class));

    @Test
    void smtpProviderCreatesExactlyOneGateway() {
        contextRunner
                .withPropertyValues("app.mail.provider=smtp")
                .run(context -> assertEquals(
                        1,
                        context.getBeansOfType(MailGateway.class).size()
                ));
    }

    @Test
    void smtpRemainsLocalDefault() {
        contextRunner.run(context -> assertEquals(
                1,
                context.getBeansOfType(MailGateway.class).size()
        ));
    }

    @Test
    void defaultSenderDoesNotUseLegacyUnverifiedDomain() {
        assertEquals("no-reply@localhost", new MailProperties().getFrom());
    }

    @Test
    void resendProviderCreatesExactlyOneGateway() {
        contextRunner
                .withPropertyValues(
                        "app.mail.provider=resend",
                        "app.mail.resend.api-key=re_test_key"
                )
                .run(context -> {
                    assertEquals(1, context.getBeansOfType(MailGateway.class).size());
                    assertEquals(1, context.getBeansOfType(ResendMailGateway.class).size());
                });
    }

    @Test
    void resendProviderRequiresApiKey() {
        contextRunner
                .withPropertyValues("app.mail.provider=resend")
                .run(context -> {
                    Throwable cause = context.getStartupFailure();
                    while (cause.getCause() != null) {
                        cause = cause.getCause();
                    }
                    assertTrue(cause.getMessage().contains("RESEND_API_KEY is required"));
                });
    }
}
