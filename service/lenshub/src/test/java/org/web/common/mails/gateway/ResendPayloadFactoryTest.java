package org.web.common.mails.gateway;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ResendPayloadFactoryTest {

    @Test
    @SuppressWarnings("unchecked")
    void mapsCidAttachmentAsBase64(@TempDir Path tempDir) throws Exception {
        Path image = tempDir.resolve("camera.png");
        Files.writeString(image, "image-bytes", StandardCharsets.UTF_8);

        Map<String, Object> payload = new ResendPayloadFactory(1024).create(
                message(List.of(new MailAttachment(
                        "camera.png",
                        "image/png",
                        "product-image",
                        image
                )))
        );

        List<Map<String, Object>> attachments =
                (List<Map<String, Object>>) payload.get("attachments");
        assertEquals("camera.png", attachments.get(0).get("filename"));
        assertEquals("aW1hZ2UtYnl0ZXM=", attachments.get(0).get("content"));
        assertEquals("product-image", attachments.get(0).get("content_id"));
    }

    @Test
    void rejectsAttachmentAboveConfiguredLimit(@TempDir Path tempDir) throws Exception {
        Path attachment = tempDir.resolve("large.txt");
        Files.writeString(attachment, "too large", StandardCharsets.UTF_8);

        MailDeliveryException exception = assertThrows(
                MailDeliveryException.class,
                () -> new ResendPayloadFactory(2).create(message(
                        List.of(new MailAttachment(
                                "large.txt",
                                "text/plain",
                                null,
                                attachment
                        ))
                ))
        );

        assertFalse(exception.isTransientFailure());
    }

    private MailMessage message(List<MailAttachment> attachments) {
        return new MailMessage(
                "LensHub <mail@lenshub.shop>",
                "customer@example.com",
                "Subject unchanged",
                "<strong>Body unchanged</strong>",
                null,
                attachments,
                MailCategory.ORDER,
                null
        );
    }
}
