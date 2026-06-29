package org.web.common.mails.gateway;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SmtpMailGatewayTest {

    private final JavaMailSender mailSender = mock(JavaMailSender.class);
    private final SmtpMailGateway gateway = new SmtpMailGateway(mailSender);

    @Test
    void sendsHtmlAndInlineAttachment() throws Exception {
        MimeMessage mimeMessage = message();
        Path image = Files.createTempFile("mail-gateway-", ".png");
        Files.writeString(image, "image");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        MailDeliveryResult result = gateway.send(new MailMessage(
                "LensHub <no-reply@lenshub.shop>",
                "user@example.com",
                "Activation",
                "<p>Hello <img src=\"cid:product-1\"/></p>",
                null,
                List.of(new MailAttachment(
                        "product-1.png",
                        "image/png",
                        "product-1",
                        image
                )),
                MailCategory.ACTIVATION,
                null
        ));

        mimeMessage.saveChanges();
        verify(mailSender).send(same(mimeMessage));
        assertEquals("smtp", result.provider());
        assertEquals("Activation", mimeMessage.getSubject());
        assertTrue(mimeMessage.getContent() instanceof MimeMultipart);
        MimeMultipart root = (MimeMultipart) mimeMessage.getContent();
        assertEquals(1, root.getCount());
        assertTrue(root.getBodyPart(0).getContent() instanceof MimeMultipart);
        assertEquals(
                2,
                ((MimeMultipart) root.getBodyPart(0).getContent()).getCount()
        );

        Files.deleteIfExists(image);
    }

    @Test
    void wrapsProviderFailureWithoutRecipientInMessage() {
        MimeMessage mimeMessage = message();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailSendException("connection failed"))
                .when(mailSender)
                .send(same(mimeMessage));

        MailDeliveryException exception = assertThrows(
                MailDeliveryException.class,
                () -> gateway.send(messageWithoutAttachments())
        );

        assertEquals("smtp", exception.getProvider());
        assertTrue(exception.isTransientFailure());
        assertFalse(exception.getMessage().contains("user@example.com"));
    }

    @Test
    void inlineAttachmentRequiresContentType() throws Exception {
        Path image = Files.createTempFile("mail-gateway-", ".img");
        try {
            assertThrows(
                    IllegalArgumentException.class,
                    () -> new MailAttachment("image.img", null, "image", image)
            );
        } finally {
            Files.deleteIfExists(image);
        }
    }

    private MimeMessage message() {
        return new MimeMessage(Session.getInstance(new Properties()));
    }

    private MailMessage messageWithoutAttachments() {
        return new MailMessage(
                "no-reply@lenshub.shop",
                "user@example.com",
                "Subject",
                "<p>Body</p>",
                null,
                List.of(),
                MailCategory.SUPPORT,
                null
        );
    }
}
